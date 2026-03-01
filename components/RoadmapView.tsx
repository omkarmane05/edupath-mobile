import React, { useMemo } from 'react';
import { Rocket, BookOpen, Clock, Youtube } from 'lucide-react';

interface RoadmapNode {
    id: string;
    level: number;
    type: 'root' | 'branch' | 'leaf';
    label: string;
    data: {
        goal: string;
        duration: string;
        resource: string;
    };
}

interface RoadmapEdge {
    id: string;
    source: string;
    target: string;
}

interface RoadmapViewProps {
    data: {
        nodes: RoadmapNode[];
        edges: RoadmapEdge[];
    };
    onNodeClick?: (node: RoadmapNode) => void;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ data, onNodeClick }) => {
    if (!data || !data.nodes) return <div className="p-10 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">No roadmap data available</div>;

    const { nodes, edges } = data;

    // Simple layout calculation
    // Group nodes by level
    const levels = useMemo(() => {
        const lvlMap: Record<number, RoadmapNode[]> = {};
        nodes.forEach(node => {
            if (!lvlMap[node.level]) lvlMap[node.level] = [];
            lvlMap[node.level].push(node);
        });
        return lvlMap;
    }, [nodes]);

    // Calculate coordinates
    // Y-axis = level * verticalSpacing
    // X-axis = centered based on number of items in level
    const nodePositions = useMemo(() => {
        const positions: Record<string, { x: number, y: number }> = {};
        const LEVEL_HEIGHT = 180;
        const NODE_WIDTH = 220;
        const GAP_X = 40;

        Object.keys(levels).forEach(lvlKey => {
            const lvl = parseInt(lvlKey);
            const nodesInLevel = levels[lvl];
            const totalWidth = nodesInLevel.length * NODE_WIDTH + (nodesInLevel.length - 1) * GAP_X;

            nodesInLevel.forEach((node, index) => {
                // Center the group
                const startX = -totalWidth / 2 + NODE_WIDTH / 2;
                positions[node.id] = {
                    x: startX + index * (NODE_WIDTH + GAP_X),
                    y: (lvl - 1) * LEVEL_HEIGHT
                };
            });
        });
        return positions;
    }, [levels]);

    const maxLevel = Math.max(...nodes.map(n => n.level || 1));
    const height = maxLevel * 200; // Approximate height

    const maxNodesInLevel = Math.max(...Object.values(levels).map(l => l.length));
    const requiredWidth = Math.max(window.innerWidth, maxNodesInLevel * 300); // Safety margin
    const centerX = requiredWidth / 2;

    return (
        <div className="relative w-full overflow-x-auto overflow-y-hidden no-scrollbar" style={{ height: `${height}px`, minHeight: '600px' }}>
            <div style={{ width: requiredWidth, height: '100%', position: 'relative' }}>

                {/* SVG Layer for Connections */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
                        </marker>
                    </defs>
                    <g transform={`translate(${centerX}, 0)`}>
                        {edges.map(edge => {
                            const start = nodePositions[edge.source];
                            const end = nodePositions[edge.target];
                            if (!start || !end) return null;

                            // Offset to connect bottom of source to top of target
                            // Node Top = y + 60
                            // Node Height = 140
                            // Start (Bottom) = y + 60 + 140 = y + 200
                            // End (Top) = y + 60

                            const startY = start.y + 200;
                            const endY = end.y + 60;

                            // Curved path (Bezier)
                            const midY = (startY + endY) / 2;
                            const pathD = `M ${start.x} ${startY} C ${start.x} ${midY}, ${end.x} ${endY}, ${end.x} ${endY - 5}`; // Small cubic ease at end

                            return (
                                <path
                                    key={edge.id}
                                    d={pathD}
                                    stroke="#cbd5e1"
                                    strokeWidth="2"
                                    fill="none"
                                    markerEnd="url(#arrowhead)"
                                    className="transition-all duration-500"
                                />
                            );
                        })}
                    </g>
                </svg>

                {/* Node Layer */}
                {nodes.map(node => {
                    const pos = nodePositions[node.id];
                    if (!pos) return null;

                    const isRoot = node.type === 'root';

                    return (
                        <div
                            key={node.id}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 w-[220px]`}
                            style={{
                                left: `calc(50% + ${pos.x}px)`,
                                top: `${pos.y + 60}px`
                            }}
                        >
                            <div
                                className={`
                  h-[140px] p-4 rounded-[1.5rem] border shadow-sm flex flex-col justify-between
                  ${isRoot ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 hover:border-blue-500'}
                  group cursor-pointer transition-all active:scale-95 relative z-10
                `}
                                onClick={() => onNodeClick?.(node)}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isRoot ? 'bg-slate-800 text-slate-300' : 'bg-blue-50 text-blue-600'}`}>
                                        Level {node.level}
                                    </span>
                                    {!isRoot && <Clock className="w-3 h-3 text-slate-300" />}
                                </div>

                                <h3 className={`font-black text-[14px] leading-tight ${isRoot ? 'text-white' : 'text-slate-900'}`}>
                                    {node.label}
                                </h3>

                                <p className={`text-[10px] font-bold line-clamp-2 ${isRoot ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {node.data.goal}
                                </p>

                                {!isRoot && (
                                    <div className="mt-1 pt-2 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                                            <Rocket className="w-3 h-3" /> {node.data.duration}
                                        </span>
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center">
                                            {/* Status indicator - visual only for now, logic in modal */}
                                            <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-blue-400 transition-colors" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RoadmapView;
