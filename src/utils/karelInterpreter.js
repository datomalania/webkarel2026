/**
 * Karel Interpreter - Executes Karel commands in a virtual world
 */

// Direction constants
export const Direction = {
    NORTH: 'north',
    EAST: 'east',
    SOUTH: 'south',
    WEST: 'west',
};

// Direction vectors for movement
const DIRECTION_VECTORS = {
    [Direction.NORTH]: { x: 0, y: 1 },
    [Direction.EAST]: { x: 1, y: 0 },
    [Direction.SOUTH]: { x: 0, y: -1 },
    [Direction.WEST]: { x: -1, y: 0 },
};

// Turn left mapping
const TURN_LEFT = {
    [Direction.NORTH]: Direction.WEST,
    [Direction.WEST]: Direction.SOUTH,
    [Direction.SOUTH]: Direction.EAST,
    [Direction.EAST]: Direction.NORTH,
};

/**
 * Parse a world file format into a world state object
 */
export function parseWorld(worldFileContent) {
    const world = {
        dimensions: { width: 1, height: 1 },
        walls: [],
        beepers: {},
        karel: { x: 1, y: 1, direction: Direction.EAST },
        beeperBag: 0,
    };

    const lines = worldFileContent.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.includes(':')) continue;

        const [keyword, params] = trimmed.split(':').map(s => s.trim().toLowerCase());

        if (keyword === 'dimension') {
            const match = params.match(/\((\d+),\s*(\d+)\)/);
            if (match) {
                world.dimensions = { width: parseInt(match[1]), height: parseInt(match[2]) };
            }
        } else if (keyword === 'wall') {
            const match = params.match(/\((\d+),\s*(\d+)\);\s*(\w+)/);
            if (match) {
                world.walls.push({
                    x: parseInt(match[1]),
                    y: parseInt(match[2]),
                    direction: match[3],
                });
            }
        } else if (keyword === 'beeper') {
            const match = params.match(/\((\d+),\s*(\d+)\);\s*(\d+)/);
            if (match) {
                const key = `${match[1]},${match[2]}`;
                world.beepers[key] = parseInt(match[3]);
            }
        } else if (keyword === 'karel') {
            const match = params.match(/\((\d+),\s*(\d+)\);\s*(\w+)/);
            if (match) {
                world.karel = {
                    x: parseInt(match[1]),
                    y: parseInt(match[2]),
                    direction: match[3],
                };
            }
        } else if (keyword === 'beeperbag') {
            if (params === 'infinity' || params === 'infinite') {
                world.beeperBag = Infinity;
            } else {
                world.beeperBag = parseInt(params) || 0;
            }
        }
    }

    return world;
}

/**
 * Deep clone a world state
 */
export function cloneWorld(world) {
    return {
        dimensions: { ...world.dimensions },
        walls: world.walls.map(w => ({ ...w })),
        beepers: { ...world.beepers },
        karel: { ...world.karel },
        beeperBag: world.beeperBag,
    };
}

/**
 * Check if there's a wall blocking movement in a direction
 */
function isWallBlocking(world, x, y, direction) {
    // Check boundary walls
    const { width, height } = world.dimensions;

    if (direction === Direction.NORTH && y >= height) return true;
    if (direction === Direction.SOUTH && y <= 1) return true;
    if (direction === Direction.EAST && x >= width) return true;
    if (direction === Direction.WEST && x <= 1) return true;

    // Check internal walls
    for (const wall of world.walls) {
        if (wall.x === x && wall.y === y && wall.direction === direction) {
            return true;
        }
        // Check from adjacent cell perspective
        const vec = DIRECTION_VECTORS[direction];
        const adjX = x + vec.x;
        const adjY = y + vec.y;
        const oppositeDir = TURN_LEFT[TURN_LEFT[direction]]; // Opposite direction
        if (wall.x === adjX && wall.y === adjY && wall.direction === oppositeDir) {
            return true;
        }
    }

    return false;
}

/**
 * Karel command implementations
 */
const KAREL_COMMANDS = {
    move: (world) => {
        const { x, y, direction } = world.karel;
        if (isWallBlocking(world, x, y, direction)) {
            throw new Error(`კარელი ჩაიკეტა! პოზიცია: (${x}, ${y}), მიმართულება: ${direction}. კარელი ვერ წავა წინ, რადგან გზა დაბლოკილია.`);
        }
        const vec = DIRECTION_VECTORS[direction];
        world.karel.x += vec.x;
        world.karel.y += vec.y;
    },

    turn_left: (world) => {
        world.karel.direction = TURN_LEFT[world.karel.direction];
    },

    pick_beeper: (world) => {
        const key = `${world.karel.x},${world.karel.y}`;
        if (!world.beepers[key] || world.beepers[key] <= 0) {
            throw new Error(`კარელი ვერ აიღებს ბიპერს პოზიციაზე (${world.karel.x}, ${world.karel.y}) - ბიპერი არ არის!`);
        }
        world.beepers[key]--;
        if (world.beepers[key] === 0) {
            delete world.beepers[key];
        }
        world.beeperBag++;
    },

    put_beeper: (world) => {
        if (world.beeperBag <= 0) {
            throw new Error('კარელს არ აქვს ბიპერი ჩანთაში!');
        }
        const key = `${world.karel.x},${world.karel.y}`;
        world.beepers[key] = (world.beepers[key] || 0) + 1;
        world.beeperBag--;
    },
};

// Condition checks
const KAREL_CONDITIONS = {
    front_is_clear: (world) => !isWallBlocking(world, world.karel.x, world.karel.y, world.karel.direction),
    front_is_blocked: (world) => isWallBlocking(world, world.karel.x, world.karel.y, world.karel.direction),
    left_is_clear: (world) => !isWallBlocking(world, world.karel.x, world.karel.y, TURN_LEFT[world.karel.direction]),
    left_is_blocked: (world) => isWallBlocking(world, world.karel.x, world.karel.y, TURN_LEFT[world.karel.direction]),
    right_is_clear: (world) => {
        const rightDir = TURN_LEFT[TURN_LEFT[TURN_LEFT[world.karel.direction]]];
        return !isWallBlocking(world, world.karel.x, world.karel.y, rightDir);
    },
    right_is_blocked: (world) => {
        const rightDir = TURN_LEFT[TURN_LEFT[TURN_LEFT[world.karel.direction]]];
        return isWallBlocking(world, world.karel.x, world.karel.y, rightDir);
    },
    beepers_present: (world) => {
        const key = `${world.karel.x},${world.karel.y}`;
        return (world.beepers[key] || 0) > 0;
    },
    no_beepers_present: (world) => {
        const key = `${world.karel.x},${world.karel.y}`;
        return (world.beepers[key] || 0) === 0;
    },
    beepers_in_bag: (world) => world.beeperBag > 0,
    no_beepers_in_bag: (world) => world.beeperBag <= 0,
    facing_north: (world) => world.karel.direction === Direction.NORTH,
    facing_south: (world) => world.karel.direction === Direction.SOUTH,
    facing_east: (world) => world.karel.direction === Direction.EAST,
    facing_west: (world) => world.karel.direction === Direction.WEST,
    not_facing_north: (world) => world.karel.direction !== Direction.NORTH,
    not_facing_south: (world) => world.karel.direction !== Direction.SOUTH,
    not_facing_east: (world) => world.karel.direction !== Direction.EAST,
    not_facing_west: (world) => world.karel.direction !== Direction.WEST,
};

/**
 * Simple Karel code interpreter
 * Supports: def main(), move(), turn_left(), pick_beeper(), put_beeper()
 * Supports: while loops, if statements, and user-defined functions
 */
export function interpretKarelCode(code, initialWorld, onStep) {
    const world = cloneWorld(initialWorld);
    const steps = [];
    let stepCount = 0;
    const MAX_STEPS = 10000;

    // Extract function definitions
    const functions = {};
    const funcRegex = /def\s+(\w+)\s*\(\s*\)\s*:/g;
    let match;

    while ((match = funcRegex.exec(code)) !== null) {
        const funcName = match[1];
        const startIndex = match.index + match[0].length;
        const funcBody = extractBlock(code, startIndex);
        functions[funcName] = funcBody;
    }

    if (!functions.main) {
        throw new Error('main() ფუნქცია ვერ მოიძებნა! გთხოვთ, განსაზღვროთ def main(): ფუნქცია.');
    }

    // Execute main function
    executeBlock(functions.main, world, functions, steps, () => stepCount++, MAX_STEPS, onStep);

    return { finalWorld: world, steps };
}

/**
 * Extract an indented block of code
 */
function extractBlock(code, startIndex) {
    const lines = code.slice(startIndex).split('\n');
    const blockLines = [];
    let baseIndent = null;

    for (const line of lines) {
        if (line.trim() === '') {
            blockLines.push('');
            continue;
        }

        const indent = line.match(/^\s*/)[0].length;

        if (baseIndent === null) {
            baseIndent = indent;
        }

        if (indent < baseIndent && line.trim() !== '') {
            break;
        }

        blockLines.push(line);
    }

    return blockLines.join('\n');
}

/**
 * Execute a block of Karel code
 */
function executeBlock(block, world, functions, steps, incrementStep, maxSteps, onStep) {
    const lines = block.split('\n');
    let i = 0;

    while (i < lines.length) {
        const line = lines[i].trim();

        if (!line || line.startsWith('#') || line.startsWith('"""') || line.startsWith("'''")) {
            i++;
            continue;
        }

        // Check step limit
        if (incrementStep() > maxSteps) {
            throw new Error('პროგრამამ გადააჭარბა ნაბიჯების მაქსიმალურ რაოდენობას (10000). შესაძლოა უსასრულო ციკლია?');
        }

        // While loop
        if (line.startsWith('while ')) {
            const conditionMatch = line.match(/while\s+(.+):/);
            if (conditionMatch) {
                const condition = conditionMatch[1].trim().replace('()', '');
                const loopBody = extractBlockFromLines(lines, i + 1);

                while (evaluateCondition(condition, world)) {
                    executeBlock(loopBody, world, functions, steps, incrementStep, maxSteps, onStep);
                }

                i += countBlockLines(lines, i + 1) + 1;
                continue;
            }
        }

        // If statement
        if (line.startsWith('if ')) {
            const conditionMatch = line.match(/if\s+(.+):/);
            if (conditionMatch) {
                const condition = conditionMatch[1].trim().replace('()', '');
                const ifBody = extractBlockFromLines(lines, i + 1);
                const blockSize = countBlockLines(lines, i + 1);

                if (evaluateCondition(condition, world)) {
                    executeBlock(ifBody, world, functions, steps, incrementStep, maxSteps, onStep);
                }

                i += blockSize + 1;
                continue;
            }
        }

        // Function call or command
        const callMatch = line.match(/^(\w+)\s*\(\s*\)/);
        if (callMatch) {
            const funcName = callMatch[1];

            if (KAREL_COMMANDS[funcName]) {
                KAREL_COMMANDS[funcName](world);
                steps.push({ command: funcName, world: cloneWorld(world) });
                if (onStep) onStep(cloneWorld(world), funcName);
            } else if (functions[funcName]) {
                executeBlock(functions[funcName], world, functions, steps, incrementStep, maxSteps, onStep);
            } else if (!['pass', 'run_karel_program'].includes(funcName)) {
                // Check if it might be a condition being called incorrectly
                if (KAREL_CONDITIONS[funcName]) {
                    // Ignore conditions called as statements
                } else {
                    throw new Error(`უცნობი ბრძანება: ${funcName}()`);
                }
            }
        }

        i++;
    }
}

/**
 * Extract block from lines array starting at given index
 */
function extractBlockFromLines(lines, startIndex) {
    const blockLines = [];
    let baseIndent = null;

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '') {
            blockLines.push('');
            continue;
        }

        const indent = line.match(/^\s*/)[0].length;

        if (baseIndent === null) {
            baseIndent = indent;
        }

        if (indent < baseIndent && line.trim() !== '') {
            break;
        }

        blockLines.push(line);
    }

    return blockLines.join('\n');
}

/**
 * Count lines in a block
 */
function countBlockLines(lines, startIndex) {
    let count = 0;
    let baseIndent = null;

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '') {
            count++;
            continue;
        }

        const indent = line.match(/^\s*/)[0].length;

        if (baseIndent === null) {
            baseIndent = indent;
        }

        if (indent < baseIndent && line.trim() !== '') {
            break;
        }

        count++;
    }

    return count;
}

/**
 * Evaluate a condition
 */
function evaluateCondition(condition, world) {
    const condName = condition.replace('()', '').trim();

    if (KAREL_CONDITIONS[condName]) {
        return KAREL_CONDITIONS[condName](world);
    }

    throw new Error(`უცნობი პირობა: ${condition}`);
}

/**
 * Compare two world states
 */
export function compareWorlds(world1, world2) {
    // Compare Karel position and direction
    if (world1.karel.x !== world2.karel.x ||
        world1.karel.y !== world2.karel.y ||
        world1.karel.direction !== world2.karel.direction) {
        return false;
    }

    // Compare beepers
    const keys1 = Object.keys(world1.beepers).filter(k => world1.beepers[k] > 0);
    const keys2 = Object.keys(world2.beepers).filter(k => world2.beepers[k] > 0);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (world1.beepers[key] !== world2.beepers[key]) return false;
    }

    return true;
}
