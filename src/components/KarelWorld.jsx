import { useRef, useEffect, useCallback, useState } from 'react';
import { Direction } from '../utils/karelInterpreter';
import './KarelWorld.css';

// Visual constants
const CELL_SIZE = 50;
const PADDING = 30;
const WALL_THICKNESS = 4;
const BEEPER_RADIUS = 16;
const CORNER_DOT_SIZE = 3;

// Colors
const COLORS = {
    background: '#0f0f1a',
    grid: '#2a2a45',
    wall: '#64748b',
    beeper: '#fbbf24',
    beeperText: '#1a1a2e',
    karel: '#6366f1',
    karelOutline: '#818cf8',
    text: '#94a3b8',
};

/**
 * Draw Karel robot on canvas
 */
function drawKarel(ctx, x, y, direction, cellSize) {
    const centerX = PADDING + (x - 0.5) * cellSize;
    const centerY = ctx.canvas.height - PADDING - (y - 0.5) * cellSize;
    const size = cellSize * 0.6;

    ctx.save();
    ctx.translate(centerX, centerY);

    // Rotate based on direction
    const rotations = {
        [Direction.EAST]: 0,
        [Direction.NORTH]: -Math.PI / 2,
        [Direction.WEST]: Math.PI,
        [Direction.SOUTH]: Math.PI / 2,
    };
    ctx.rotate(rotations[direction] || 0);

    // Draw Karel body (arrow shape)
    ctx.beginPath();
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(-size / 3, -size / 3);
    ctx.lineTo(-size / 6, 0);
    ctx.lineTo(-size / 3, size / 3);
    ctx.closePath();

    // Gradient fill
    const gradient = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
    gradient.addColorStop(0, COLORS.karelOutline);
    gradient.addColorStop(1, COLORS.karel);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Outline
    ctx.strokeStyle = COLORS.karelOutline;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eye
    ctx.beginPath();
    ctx.arc(size / 6, 0, size / 10, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    ctx.restore();
}

/**
 * Draw a beeper on canvas
 */
function drawBeeper(ctx, x, y, count, cellSize) {
    const centerX = PADDING + (x - 0.5) * cellSize;
    const centerY = ctx.canvas.height - PADDING - (y - 0.5) * cellSize;

    // Beeper diamond
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(Math.PI / 4);

    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, BEEPER_RADIUS);
    gradient.addColorStop(0, '#fde68a');
    gradient.addColorStop(1, COLORS.beeper);

    ctx.fillStyle = gradient;
    ctx.fillRect(-BEEPER_RADIUS / 1.4, -BEEPER_RADIUS / 1.4, BEEPER_RADIUS * 1.4, BEEPER_RADIUS * 1.4);

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.strokeRect(-BEEPER_RADIUS / 1.4, -BEEPER_RADIUS / 1.4, BEEPER_RADIUS * 1.4, BEEPER_RADIUS * 1.4);

    ctx.restore();

    // Count text
    if (count > 1) {
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = COLORS.beeperText;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(count.toString(), centerX, centerY);
    }
}

/**
 * Draw walls on canvas
 */
function drawWall(ctx, wall, cellSize, worldHeight) {
    const { x, y, direction } = wall;
    const baseX = PADDING + (x - 1) * cellSize;
    const baseY = ctx.canvas.height - PADDING - y * cellSize;

    ctx.strokeStyle = COLORS.wall;
    ctx.lineWidth = WALL_THICKNESS;
    ctx.lineCap = 'round';
    ctx.beginPath();

    switch (direction) {
        case Direction.NORTH:
            ctx.moveTo(baseX, baseY);
            ctx.lineTo(baseX + cellSize, baseY);
            break;
        case Direction.SOUTH:
            ctx.moveTo(baseX, baseY + cellSize);
            ctx.lineTo(baseX + cellSize, baseY + cellSize);
            break;
        case Direction.WEST:
            ctx.moveTo(baseX, baseY);
            ctx.lineTo(baseX, baseY + cellSize);
            break;
        case Direction.EAST:
            ctx.moveTo(baseX + cellSize, baseY);
            ctx.lineTo(baseX + cellSize, baseY + cellSize);
            break;
    }

    ctx.stroke();
}

/**
 * KarelWorld Component
 * Renders the Karel world on a canvas
 */
export default function KarelWorld({
    world,
    title = 'კარელის სამყარო',
    onReset,
    speed = 50,
    onSpeedChange
}) {
    const canvasRef = useRef(null);

    // Calculate canvas size
    const canvasWidth = world ? world.dimensions.width * CELL_SIZE + PADDING * 2 : 400;
    const canvasHeight = world ? world.dimensions.height * CELL_SIZE + PADDING * 2 : 300;

    // Draw the world
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !world) return;

        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.fillStyle = COLORS.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const { dimensions, walls, beepers, karel } = world;

        // Draw grid
        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth = 1;

        // Vertical lines
        for (let x = 0; x <= dimensions.width; x++) {
            ctx.beginPath();
            ctx.moveTo(PADDING + x * CELL_SIZE, PADDING);
            ctx.lineTo(PADDING + x * CELL_SIZE, PADDING + dimensions.height * CELL_SIZE);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= dimensions.height; y++) {
            ctx.beginPath();
            ctx.moveTo(PADDING, PADDING + y * CELL_SIZE);
            ctx.lineTo(PADDING + dimensions.width * CELL_SIZE, PADDING + y * CELL_SIZE);
            ctx.stroke();
        }

        // Draw corner dots
        ctx.fillStyle = COLORS.grid;
        for (let x = 1; x <= dimensions.width; x++) {
            for (let y = 1; y <= dimensions.height; y++) {
                const dotX = PADDING + (x - 0.5) * CELL_SIZE;
                const dotY = canvas.height - PADDING - (y - 0.5) * CELL_SIZE;
                ctx.beginPath();
                ctx.arc(dotX, dotY, CORNER_DOT_SIZE, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw boundary walls (thicker)
        ctx.strokeStyle = COLORS.wall;
        ctx.lineWidth = WALL_THICKNESS;
        ctx.strokeRect(PADDING, PADDING, dimensions.width * CELL_SIZE, dimensions.height * CELL_SIZE);

        // Draw internal walls
        for (const wall of walls) {
            drawWall(ctx, wall, CELL_SIZE, dimensions.height);
        }

        // Draw beepers
        for (const [key, count] of Object.entries(beepers)) {
            if (count > 0) {
                const [bx, by] = key.split(',').map(Number);
                drawBeeper(ctx, bx, by, count, CELL_SIZE);
            }
        }

        // Draw Karel
        drawKarel(ctx, karel.x, karel.y, karel.direction, CELL_SIZE);

        // Draw axis labels
        ctx.font = '11px Inter, sans-serif';
        ctx.fillStyle = COLORS.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // X-axis labels (avenues)
        for (let x = 1; x <= dimensions.width; x++) {
            ctx.fillText(x.toString(), PADDING + (x - 0.5) * CELL_SIZE, canvas.height - PADDING + 8);
        }

        // Y-axis labels (streets)
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let y = 1; y <= dimensions.height; y++) {
            ctx.fillText(y.toString(), PADDING - 8, canvas.height - PADDING - (y - 0.5) * CELL_SIZE);
        }

    }, [world]);

    // Redraw when world changes
    useEffect(() => {
        draw();
    }, [draw]);

    if (!world) {
        return (
            <div className="karel-world-container">
                <div className="karel-world-header">
                    <span className="karel-world-title">
                        <span className="karel-world-title-icon">🤖</span>
                        {title}
                    </span>
                </div>
                <div className="karel-world-canvas-container">
                    <div style={{ color: 'var(--color-text-muted)' }}>
                        სამყაროს ჩატვირთვა...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="karel-world-container">
            {/* Header */}
            <div className="karel-world-header">
                <span className="karel-world-title">
                    <span className="karel-world-title-icon">🤖</span>
                    {title}
                </span>
                <div className="karel-world-controls">
                    {onReset && (
                        <button
                            className="karel-world-control-btn"
                            onClick={onReset}
                            title="გადატვირთვა"
                        >
                            🔄
                        </button>
                    )}
                </div>
            </div>

            {/* Canvas */}
            <div className="karel-world-canvas-container">
                <canvas
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    className="karel-world-canvas"
                    style={{ borderRadius: 'var(--radius-md)' }}
                />
            </div>

            {/* Footer */}
            <div className="karel-world-footer">
                <div className="karel-world-info">
                    <span className="karel-world-info-item">
                        <span className="karel-world-info-icon">📍</span>
                        ({world.karel.x}, {world.karel.y})
                    </span>
                    <span className="karel-world-info-item">
                        <span className="karel-world-info-icon">🧭</span>
                        {world.karel.direction}
                    </span>
                    <span className="karel-world-info-item">
                        <span className="karel-world-info-icon">💎</span>
                        ბიპერები: {world.beeperBag === Infinity ? '∞' : world.beeperBag}
                    </span>
                </div>
                <div className="speed-control">
                    <span className="speed-control-label">სიჩქარე:</span>
                    <input
                        type="range"
                        className="speed-control-slider"
                        min="1"
                        max="100"
                        value={speed}
                        onChange={(e) => onSpeedChange?.(Number(e.target.value))}
                    />
                </div>
            </div>
        </div>
    );
}
