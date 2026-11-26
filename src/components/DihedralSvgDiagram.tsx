import React from 'react';
import { dihedralToVertexPerm, formatDihedral, type DihedralElement } from '../math/dihedral.ts';

interface DihedralSvgDiagramProps {
  element: DihedralElement;
  size?: number;
  showAxis?: boolean;
  identitySymbol?: string;
}

export const DihedralSvgDiagram: React.FC<DihedralSvgDiagramProps> = ({
  element,
  size = 280,
  showAxis = true,
  identitySymbol = '1',
}) => {
  const n = element.n;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.34;
  const perm = dihedralToVertexPerm(element);

  const vertexCoords = (idx: number) => {
    // Counterclockwise starting from (1, 0) at angle 0 (flipped y for SVG)
    const angle = (-2 * Math.PI * idx) / n;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  const points = Array.from({ length: n }, (_, i) => vertexCoords(i));
  const polygonPoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Reflection axis angle in standard coordinates:
  // If element = mu * rho^k, axis passes through angle -(pi * k) / n in math coords (so +pi*k/n in SVG y-down).
  // Specifically: vertex v maps to (-v - k) mod n, fixed angle satisfies 2*theta + 2*pi*k/n = 0 => theta = -pi*k/n.
  const axisMathAngle = (-Math.PI * element.k) / n;
  const axisX1 = cx + radius * 1.24 * Math.cos(axisMathAngle);
  const axisY1 = cy - radius * 1.24 * Math.sin(axisMathAngle);
  const axisX2 = cx - radius * 1.24 * Math.cos(axisMathAngle);
  const axisY2 = cy + radius * 1.24 * Math.sin(axisMathAngle);

  // Rotation arc for pure rotations k > 0
  const rotArcEndAngle = (-2 * Math.PI * element.k) / n;
  const arcR = radius * 0.42;
  const arcEndX = cx + arcR * Math.cos(rotArcEndAngle);
  const arcEndY = cy + arcR * Math.sin(rotArcEndAngle);
  const largeArcFlag = element.k > n / 2 ? 1 : 0;

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="max-w-full h-auto select-none"
        role="img"
        aria-label={`Regular ${n}-gon transformed by ${formatDihedral(element, identitySymbol)}`}
      >
        {/* Coordinate reference circle */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.14}
          strokeDasharray="4 4"
        />

        {/* Reflection axis when ref === 1 */}
        {showAxis && element.ref === 1 && (
          <line
            x1={axisX1}
            y1={axisY1}
            x2={axisX2}
            y2={axisY2}
            stroke="#0d9488"
            strokeWidth={2}
            strokeDasharray="6 4"
          />
        )}

        {/* Polygon body */}
        <polygon
          points={polygonPoints}
          fill={element.ref === 1 ? 'rgba(13, 148, 136, 0.12)' : 'rgba(11, 31, 58, 0.08)'}
          stroke={element.ref === 1 ? '#0d9488' : '#1d4ed8'}
          strokeWidth={2.2}
        />

        {/* Highlight edge 0 -> 1 to visualize orientation preservation vs reversal */}
        {(() => {
          const p0 = vertexCoords(perm[0]);
          const p1 = vertexCoords(perm[1]);
          return (
            <line
              x1={p0.x}
              y1={p0.y}
              x2={p1.x}
              y2={p1.y}
              stroke="#0d9488"
              strokeWidth={3.5}
              strokeLinecap="round"
            />
          );
        })()}

        {/* Rotation arc */}
        {element.ref === 0 && element.k > 0 && (
          <path
            d={`M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 ${largeArcFlag} 0 ${arcEndX.toFixed(1)} ${arcEndY.toFixed(1)}`}
            fill="none"
            stroke="#0d9488"
            strokeWidth={2}
          />
        )}

        {/* Center label */}
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          className="fill-slate-800 dark:fill-slate-100 text-sm font-semibold font-mono-math"
        >
          {formatDihedral(element, identitySymbol)}
        </text>

        {/* Vertices */}
        {Array.from({ length: n }, (_, posIdx) => {
          // Which original vertex is currently at position posIdx?
          // perm[originalVertex] = newPosition => originalVertex = perm.indexOf(posIdx)
          const origLabel = perm.indexOf(posIdx);
          const { x, y } = vertexCoords(posIdx);
          const angle = (-2 * Math.PI * posIdx) / n;
          const slotX = cx + (radius + 22) * Math.cos(angle);
          const slotY = cy + (radius + 22) * Math.sin(angle);
          const isZero = origLabel === 0;
          return (
            <g key={posIdx}>
              <circle
                cx={x}
                cy={y}
                r={14}
                fill={isZero ? '#0d9488' : '#0b1f3a'}
                stroke="#ffffff"
                strokeWidth={2}
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fill="#ffffff"
                className="text-xs font-bold font-mono-math"
              >
                {origLabel}
              </text>
              <text
                x={slotX}
                y={slotY + 3}
                textAnchor="middle"
                className="fill-slate-400 dark:fill-slate-500 text-[10px] font-mono-math"
              >
                pos {posIdx}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
