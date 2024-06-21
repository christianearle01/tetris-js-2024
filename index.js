$(document).ready(function() {
    const shape_colors = { default: 'default-color', o: 'o-color', i: 'i-color', s: 's-color', z: 'z-color', j: 'j-color', l: 'l-color', t: 't-color' };
    const keydown = { ArrowLeft: 37, ArrowRight: 39, ArrowDown: 40, ArrowUp: 38, SpaceBar: 32 };
    const [h_up, v_right, h_down, v_left] = [0, 1, 2, 3];
    const shape_rotations = [ 'horizontal_up', 'vertical_right', 'horizontal_down', 'vertical_left' ];
    const tetromino_shapes = {
        o: [{ x: 4, y: 0 }, { x: 5, y: 0 }, { x: 4, y: 1 }, { x: 5, y: 1 }],
        i: [{ x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }],
        s: [{ x: 3, y: 1 }, { x: 4, y: 1 }, { x: 4, y: 0 }, { x: 5, y: 0 }],
        z: [{ x: 3, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 1 }, { x: 5, y: 1 }],
        j: [{ x: 3, y: 0 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }],
        l: [{ x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 5, y: 0 }],
        t: [{ x: 3, y: 1 }, { x: 4, y: 1 }, { x: 4, y: 0 }, { x: 5, y: 1 }]
    };

    let tetris_grid = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    const tetrisGrid = $('#tetrisGrid');
    let curr_tetromino = '';
    let tetromino_color = '';
    let tetromino_coords = [];
    let tetromino_rotation = '';
    let enanbled_controller = false;
    let score = 0;

    /* randomize to generate tetromino */
    const randomTetromino = () => {
        const shape_keys = ['o', 'i', 's', 'z', 'j', 'l', 't'];
        const random_tetromino = shape_keys[Math.floor(Math.random() * shape_keys.length)];

        return random_tetromino;
    }

    /* execute upon document ready */
    generateDefaultGrid();
    generateTetromino();

    function resetGame(){
        for (let y = 0; y < tetris_grid.length; y++) {
            for (let x = 0; x < tetris_grid[y].length; x++) {
                tetris_grid[y][x] = 0;
                $(`#${y}-${x}`).removeClass().addClass(`cell ${shape_colors['default']}`);
            }
        }

        $('#score').text(0);
        generateTetromino();
    }

    $(document).keydown(function(e){
        if(enanbled_controller){
            switch (e.which){ 
                case keydown.ArrowLeft:
                    moveTetrominoX('arrow_left');
                    break;
                case keydown.ArrowUp:
                    moveTetrominoY('arrow_up');
                    break;
                case keydown.ArrowRight:
                    moveTetrominoX('arrow_right');
                    break;
                case keydown.ArrowDown:
                    moveTetrominoY('arrow_down');
                    break;
                case keydown.SpaceBar:
                    hardDrop();
                    break;
                default:
                    break;
            }
        }
    });

    var timer_drop;
    function timerDrop(){
        timer_drop = setInterval(() => {
            moveTetrominoY('arrow_down');
        }, 1500);
    };

    /* Generate the empty grid */
    function generateDefaultGrid() {
        for (let y = 0; y < tetris_grid.length; y++) {
            const row_cell = $('<div>').attr('id', `col_${y}`).addClass('row');
            tetrisGrid.append(row_cell);
            
            const rowElement = $(`#col_${y}`);
            for (let x = 0; x < tetris_grid[y].length; x++) {
                const cell = $('<div>').attr('id', `${y}-${x}`).addClass(`cell ${shape_colors['default']}`);
                rowElement.append(cell);
            }
        }
    }

    function generateTetromino() {
        enanbled_controller = true;
        curr_tetromino = randomTetromino();
        tetromino_color = shape_colors[curr_tetromino];
        tetromino_rotation = shape_rotations[0];

        /* Use deep copy to avoid mutation */
        tetromino_coords = JSON.parse(JSON.stringify(tetromino_shapes[curr_tetromino]));

        tetromino_coords.forEach(tetromino => {
            $(`#${tetromino.y}-${tetromino.x}`).removeClass(shape_colors['default']).addClass(tetromino_color);
            tetris_grid[tetromino.y][tetromino.x] = 1;
        });

        timerDrop();
    }

    /* Update the latest tetromino_coords */
    function moveTetrominoX(x_movement) {
        if(x_movement === 'arrow_left'){
            /* Check if have not left collision */
            let is_left_wall_collide = isCollide('left_wall_collision') || isCollide('block_collision', 'left');
            
            if(!is_left_wall_collide){
                /* Reset the Tetromino of the previous Tetromino coordinates */
                resetTetrominoBlocks();

                tetromino_coords.map(tetromino => {
                    tetromino.x -= 1;
                });

                /* Updated tetromino_coords to move the tetromino */
                newTetrominoBlocks();
            }
        }
        else if(x_movement === 'arrow_right'){
            /* Check if have not right collision */
            let is_right_wall_collide = isCollide('right_wall_collision') || isCollide('block_collision', 'right');

            if(!is_right_wall_collide){
                /* Reset the Tetromino of the previous Tetromino coordinates */
                resetTetrominoBlocks();

                tetromino_coords.map(tetromino => {
                    tetromino.x += 1;
                });

                /* Updated tetromino_coords to move the tetromino */
                newTetrominoBlocks();
            }
        }
    }

    function moveTetrominoY(y_movement) {
        if(y_movement === 'arrow_down'){
            downwardTetromino();
        }
        else if(y_movement === 'arrow_up'){
            tetrominoRotation(curr_tetromino);
        }
    }

    function hardDrop() {
        for(let ctr = 0; (ctr < tetris_grid.length) && (enanbled_controller === true); ctr++){
            downwardTetromino('hard_drop');
        }
    }

    function downwardTetromino(drop_type = 'soft_drop') {
        const is_block_collide_downward = isCollide('block_collision', 'down');

        if(tetromino_coords[1].y < 2 && is_block_collide_downward){
            clearInterval(timer_drop);
            enanbled_controller = false;
            setTimeout(() => {
                if(window.confirm('Game Over')){
                    resetGame();
                }
            }, 500);
        }
        else if(isCollide('land_collision') || is_block_collide_downward){
            clearInterval(timer_drop);
            enanbled_controller = false;
            
            setTimeout(() => {
                clearFilledLines();
                generateTetromino();
            }, 500);
        }
        else{
            /* Reset the Tetromino of the previous Tetromino coordinates */
            resetTetrominoBlocks();

            tetromino_coords.map(tetromino => {
                tetromino.y += 1;
            });

            /* Updated tetromino_coords to move the tetromino */
            newTetrominoBlocks();

            score += (drop_type === 'soft_drop') ? 4 : 8;
            $(`#score`).text(score);
        }
    }

    function resetTetrominoBlocks() {
        tetromino_coords?.forEach(tetromino => {
            let element = $(`#${tetromino.y}-${tetromino.x}`);

            if(!(element.hasClass(shape_colors['default']))){
                element.removeClass(tetromino_color).addClass(shape_colors['default']);
                tetris_grid[tetromino.y][tetromino.x] = 0;
            }
        });
    }

    function newTetrominoBlocks(){
        tetromino_coords?.forEach(tetromino => {
            let element = $(`#${tetromino.y}-${tetromino.x}`);
            element.removeClass(shape_colors['default']).addClass(tetromino_color);
            tetris_grid[tetromino.y][tetromino.x] = 1;
        });
    }

    /* Collision function */
    function isCollide (collision_type, movement = "down") {
        let is_collide = true;

        if(collision_type === 'left_wall_collision'){
            is_collide = tetromino_coords.map(coords => coords.x > 0).includes(false);
        }
        else if(collision_type === 'right_wall_collision'){
            is_collide = tetromino_coords.map(coords => coords.x < 9).includes(false);
        }
        else if(collision_type === 'land_collision'){
            is_collide = tetromino_coords.map(coords => coords.y < 19).includes(false);
        }
        else if(collision_type === 'block_collision'){
            let coords_key_arr = [];
            let coord_checker = { y: 0, x: 0 }
            tetromino_coords.forEach(coord => {
                coords_key_arr.push(`${coord.y}-${coord.x}`);
            });
            
            if(movement === 'down'){
                coord_checker.y = 1;
            }
            else if(movement === 'left'){
                coord_checker.x = -1;
            }
            else if(movement === 'right'){
                coord_checker.x = 1;
            }

            /* To check if the tetromino coords has overlap to checking block collision */
            let collide_arr = tetromino_coords.map(coords => {
                let overlap_tetromino_coord = coords_key_arr.includes(`${coords.y + coord_checker.y}-${coords.x + coord_checker.x}`);
                /* if the checking block has a value of 1 then check if the checking block coordinates does not overlap to current tetromino coordinates */
                return tetris_grid?.[coords.y + coord_checker.y]?.[coords.x + coord_checker.x] === 1 ? !overlap_tetromino_coord : false;
            });

            is_collide = collide_arr.includes(true);
        }

        return is_collide;
    }

    function clearFilledLines() {
        let full_lines_count = 0;
        
        /* Check if there are rows that are fully filled */
        for (let y = 0; y < tetris_grid.length; y++) {
            if(!tetris_grid[y].includes(0)){
                full_lines_count += 1;
            }
        }

        if(full_lines_count){
            /* Get all blocks class to be use in moving down the not filled lines */
            let blocks_arr = []; // [""]
            for (let y = 0; y < tetris_grid.length; y++) {
                /* Get the blocks class if the row lines is not filled */
                if(tetris_grid[y].includes(0) && tetris_grid[y].includes(1)){
                    blocks_arr.push([]);

                    for (let x = 0; x < tetris_grid[y].length; x++) {
                        blocks_arr[ blocks_arr.length - 1 ].push($(`#${y}-${x}`).attr('class'));
                    }
                }
            }

            let block_ctr = blocks_arr.length - 1;

            /* Update the blocks with the collected filled blocks coordinates and class */
            for (let y = tetris_grid.length - 1; y >= 0; y--) {
                for (let x = 0; x < tetris_grid[x].length; x++) {
                    /* Update the blocks to move down the not filled lines */
                    if(blocks_arr?.[block_ctr]){
                        $(`#${y}-${x}`).removeClass().addClass(blocks_arr[block_ctr][x]);
                        tetris_grid[y][x] = (blocks_arr[block_ctr][x] === 'cell default-color') ? 0 : 1;
                    }
                    /* Reset the blocks */
                    else{
                        $(`#${y}-${x}`).removeClass().addClass(`cell ${shape_colors['default']}`);
                        tetris_grid[y][x] = 0;
                    }
                }

                block_ctr -= 1;
            }

            (full_lines_count === 1) && (score += 800);
            (full_lines_count === 2) && (score += 1200);
            (full_lines_count === 3) && (score += 2000);
            (full_lines_count === 4) && (score += 3200);
            $('#score').text(score);
        }
    }

    function tetrominoRotation(shape) {
        const curr_rotation_index = shape_rotations.indexOf(tetromino_rotation);

        if(curr_rotation_index === v_left){
            tetromino_rotation = shape_rotations[h_up];
        }
        else{
            tetromino_rotation = shape_rotations[curr_rotation_index + 1];
        }

        /* Tetromino Rotation */
        if(shape === 'i'){
            /* To disable the rotation in the first row of the I Tetromino horizontal */
            if(tetromino_rotation === shape_rotations[v_right] && tetromino_coords[0].y === 0){
                tetromino_rotation = shape_rotations[h_up];
            }
            else{
                updateTetrominoRotation(shape, tetromino_rotation, curr_rotation_index);
            }
        }
        else if(['s', 'z', 'j', 'l', 't'].includes(shape)){
            updateTetrominoRotation(shape, tetromino_rotation, curr_rotation_index);
        }
    }

    /* Reusable Update Tetromino Rotation function */
    function updateTetrominoRotation(shape, curr_rotation, curr_rotation_index){
        /* Reset the Tetromino of the previous Tetromino coordinates */
        resetTetrominoBlocks();
        
        const { is_collide, tetris_coords } = rotateTetrominoCollision(shape, curr_rotation);

        if(!is_collide){
            tetromino_coords = [ ...tetris_coords ];
        }
        /* Reset to the previous Tetromino Rotation when check collision is collide */
        else{
            tetromino_rotation = shape_rotations[curr_rotation_index];
        }

        /* Updated tetromino_coords to move the tetromino */
        newTetrominoBlocks();
    }

    function updateTetrisCoordsChecker(tetris_coords, tetris_attr, callback){
        const { shape, curr_rotation } = tetris_attr;
        
        if(shape === 'i'){
            tetris_coords.map((tetromino, index) => {
                tetromino = callback(tetris_coords, tetromino, index);
            });
        }
        else{
            const { center_block } =  tetris_attr;
            tetris_coords.map((tetromino, index) => {
                let [y_ctr, x_ctr] = callback(index, { y: 0, x: 0 });
                tetromino.x = center_block.x + x_ctr;
                tetromino.y = center_block.y + y_ctr;
            });
        }

        if([shape_rotations[h_down], shape_rotations[h_up]].includes(curr_rotation)){
            const wall_kick_ctr = wallKick(shape, curr_rotation);
            wall_kick_ctr && (tetris_coords.map(tetromino => {tetromino.x += wall_kick_ctr}));
        }

        return [ ...tetris_coords ];
    }

    /***** Rotation related functions *****/
    function rotateTetrominoCollision(shape, curr_rotation){
        let is_collide = false;
        let tetris_coords = JSON.parse(JSON.stringify(tetromino_coords));
        
        if(shape === 'i'){
            /* Check the I Tetromino rotation for collision and update the current tetromino coordinates if there is no collision */
            if(curr_rotation === shape_rotations[v_right]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { shape, curr_rotation }, (tetris_coords, tetromino, index) => {
                    tetromino.x = tetris_coords[2].x;
                    tetromino.y = tetromino.y + (index - 1);

                    return { ...tetromino };
                });
            }
            else if(curr_rotation === shape_rotations[h_down]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { shape, curr_rotation }, (tetris_coords, tetromino, index) => {
                    tetromino.x = tetromino.x + (index - 2);
                    tetromino.y = tetris_coords[2].y;

                    return { ...tetromino };
                });

            }
            else if(curr_rotation === shape_rotations[v_left]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { shape, curr_rotation }, (tetris_coords, tetromino, index) => {
                    tetromino.x = tetris_coords[1].x;
                    tetromino.y = tetromino.y + (index - 2);

                    return { ...tetromino };
                });
            }
            else if(curr_rotation === shape_rotations[h_up]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { shape, curr_rotation }, (tetris_coords, tetromino, index) => {
                    tetromino.x = tetromino.x + (index - 1);
                    tetromino.y = tetris_coords[1].y;

                    return { ...tetromino };
                });
            }
        }
        else if(shape === 's'){
            const center_block = tetris_coords[1];

            /* Check the S Tetromino rotation for collision and update the current tetromino coordinates if there is no collision */
            if(curr_rotation === shape_rotations[v_right]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { center_block, curr_rotation, shape }, (index, ctr) => {
                    (index === 0) && (ctr.y = -1);
                    (index === 3) && (ctr.y = 1);
                    ([2, 3].includes(index)) && (ctr.x = 1);

                    return [ctr.y, ctr.x];
                });
            }
            else if(curr_rotation === shape_rotations[h_down]){
                
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { center_block, curr_rotation, shape }, (index, ctr) => {
                    (index === 0) && (ctr.x = 1);
                    (index === 3) && (ctr.x = -1);
                    ([2, 3].includes(index)) && (ctr.y = 1);

                    return [ctr.y, ctr.x];
                });
            }
            else if(curr_rotation === shape_rotations[v_left]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { center_block, curr_rotation, shape }, (index, ctr) => {
                    (index === 0) && (ctr.y = 1);
                    (index === 3) && (ctr.y = -1);
                    ([2, 3].includes(index)) && (ctr.x = -1);

                    return [ctr.y, ctr.x];
                });
            }
            else if(curr_rotation === shape_rotations[h_up]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { center_block, curr_rotation, shape }, (index, ctr) => {
                    (index === 0) && (ctr.x = -1);
                    (index === 3) && (ctr.x = 1);
                    ([2, 3].includes(index)) && (ctr.y = -1);

                    return [ctr.y, ctr.x];
                });
            }
        }
        else if(shape === 'z'){
            const center_block = tetris_coords[2];

            /* Check the Z Tetromino rotation for collision and update the current tetromino coordinates if there is no collision */
            if(curr_rotation === shape_rotations[v_right]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { center_block, curr_rotation, shape }, (index, ctr) => {
                    (index === 0) && (ctr.y = -1);
                    (index === 3) && (ctr.y = 1);
                    ([0, 1].includes(index)) && (ctr.x = 1);

                    return [ctr.y, ctr.x];
                });
            }
            else if(curr_rotation === shape_rotations[h_down]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { center_block, curr_rotation, shape }, (index, ctr) => {
                    (index === 0) && (ctr.x = 1);
                    (index === 3) && (ctr.x = -1);
                    ([0, 1].includes(index)) && (ctr.y = 1);

                    return [ctr.y, ctr.x];
                });
            }
            else if(curr_rotation === shape_rotations[v_left]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { center_block, curr_rotation, shape }, (index, ctr) => {
                    (index === 0) && (ctr.y = 1);
                    (index === 3) && (ctr.y = -1);
                    ([0, 1].includes(index)) && (ctr.x = -1);

                    return [ctr.y, ctr.x];
                });
            }
            else if(curr_rotation === shape_rotations[h_up]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { center_block, curr_rotation, shape }, (index, ctr) => {
                    (index === 0) && (ctr.x = -1);
                    (index === 3) && (ctr.x = 1);
                    ([0, 1].includes(index)) && (ctr.y = -1);

                    return [ctr.y, ctr.x];
                });
            }
        }
        else if(shape === 'j'){
            const center_block = tetris_coords[2];

            /* Check the J Tetromino rotation for collision and update the current tetromino coordinates if there is no collision */
            if(curr_rotation === shape_rotations[v_right]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { center_block, curr_rotation, shape }, (index, ctr) => {
                    (index === 0) && (ctr.x = 1);
                    (index === 3) && (ctr.y = 1);
                    ([0, 1].includes(index)) && (ctr.y = -1);

                    return [ctr.y, ctr.x];
                });
            }
            else if(curr_rotation === shape_rotations[h_down]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { center_block, curr_rotation, shape }, (index, ctr) => {
                    (index === 0) && (ctr.y = 1);
                    (index === 3) && (ctr.x = -1);
                    ([0, 1].includes(index)) && (ctr.x = 1);

                    return [ctr.y, ctr.x];
                });
            }
            else if(curr_rotation === shape_rotations[v_left]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { center_block, curr_rotation, shape }, (index, ctr) => {
                    (index === 0) && (ctr.x = -1);
                    (index === 3) && (ctr.y = -1);
                    ([0, 1].includes(index)) && (ctr.y = 1);

                    return [ctr.y, ctr.x];
                });
            }
            else if(curr_rotation === shape_rotations[h_up]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { center_block, curr_rotation, shape }, (index, ctr) => {
                    (index === 0) && (ctr.y = -1);
                    (index === 3) && (ctr.x = 1);
                    ([0, 1].includes(index)) && (ctr.x = -1);

                    return [ctr.y, ctr.x];
                });
            }
        }
        else if(shape === 'l'){
            const center_block = tetris_coords[1];

            /* Check the L Tetromino rotation for collision and update the current tetromino coordinates if there is no collision */
            if(curr_rotation === shape_rotations[v_right]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { center_block, curr_rotation, shape }, (index, ctr) => {
                    (index === 0) && (ctr.y = -1);
                    (index === 3) && (ctr.x = 1);
                    ([2, 3].includes(index)) && (ctr.y = 1);

                    return [ctr.y, ctr.x];
                });
            }   
            else if(curr_rotation === shape_rotations[h_down]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { center_block, curr_rotation, shape }, (index, ctr) => {
                    (index === 0) && (ctr.x = 1);
                    (index === 3) && (ctr.y = 1);
                    ([2, 3].includes(index)) && (ctr.x = -1);

                    return [ctr.y, ctr.x];
                });
            }
            else if(curr_rotation === shape_rotations[v_left]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { center_block, curr_rotation, shape }, (index, ctr) => {
                    (index === 0) && (ctr.y = 1);
                    (index === 3) && (ctr.x = -1);
                    ([2, 3].includes(index)) && (ctr.y = -1);

                    return [ctr.y, ctr.x];
                });
            }
            else if(curr_rotation === shape_rotations[h_up]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { center_block, curr_rotation, shape }, (index, ctr) => {
                    (index === 0) && (ctr.x = -1);
                    (index === 3) && (ctr.y = -1);
                    ([2, 3].includes(index)) && (ctr.x = 1);

                    return [ctr.y, ctr.x];
                });
            }
        }
        else if(shape === 't'){
            const center_block = tetris_coords[1];

            /* Check the T Tetromino rotation for collision and update the current tetromino coordinates if there is no collision */
            if(curr_rotation === shape_rotations[v_right]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { center_block, curr_rotation, shape }, (index, ctr) => {
                    (index === 0) && (ctr.y = -1);
                    (index === 2) && (ctr.y = 1);
                    (index === 3) && (ctr.x = 1);

                    return [ctr.y, ctr.x];
                });
            }
            else if(curr_rotation === shape_rotations[h_down]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { center_block, curr_rotation, shape }, (index, ctr) => {
                    (index === 0) && (ctr.x = 1);
                    (index === 2) && (ctr.y = 1);
                    (index === 3) && (ctr.x = -1);

                    return [ctr.y, ctr.x];
                });
            }
            else if(curr_rotation === shape_rotations[v_left]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { center_block, curr_rotation, shape }, (index, ctr) => {
                    (index === 0) && (ctr.y = 1);
                    (index === 2) && (ctr.x = -1);
                    (index === 3) && (ctr.y = -1);

                    return [ctr.y, ctr.x];
                });
            }
            else if(curr_rotation === shape_rotations[h_up]){
                tetris_coords = updateTetrisCoordsChecker( tetris_coords, { center_block, curr_rotation, shape }, (index, ctr) => {
                    (index === 0) && (ctr.x = -1);
                    (index === 2) && (ctr.y = -1);
                    (index === 3) && (ctr.x = 1);

                    return [ctr.y, ctr.x];
                });
            }
        }

        /* Check if the new tetromino coords collide with the tetris grid filled blocks */
        tetris_coords.map(tetromino => {
            if(tetris_grid[tetromino.y][tetromino.x] === 1){
                is_collide = true;
            }
        });

        return { is_collide, tetris_coords };
    }

    function wallKick(shape, curr_rotation){
        let x_ctr = 0;

        /* Adjust the I tetromino x position move away from the wall */
        if(shape === 'i'){
            /* Left Wall - is blocks out of bounds to left wall checker */
            if(
                (tetromino_coords[2].x === 0 && curr_rotation === shape_rotations[h_up]) || 
                (tetromino_coords[2].x === 1 && curr_rotation === shape_rotations[h_down])
            ){
                x_ctr = 1;
            }
            else if(tetromino_coords[2].x === 0 && curr_rotation === shape_rotations[h_down]){
                x_ctr = 2;
            }
            /* Right Wall - is blocks out of bounds to right wall checker */
            else if(
                (tetromino_coords[2].x === 8 && curr_rotation === shape_rotations[h_up]) || 
                (tetromino_coords[2].x === 9 && curr_rotation === shape_rotations[h_down])
            ){
                x_ctr = - 1;
            }
            else if((tetromino_coords[2].x === 9 && curr_rotation === shape_rotations[h_up])){
                x_ctr = - 2;
            }
        }
        else if(shape === 's'){
            /* Left Wall - is block leaning the left wall checker */
            if(tetromino_coords[1].x === 0 && curr_rotation === shape_rotations[h_down]){
                x_ctr = 1;
            }
            /* Right Wall - is block leaning the right wall checker */
            else if(tetromino_coords[1].x === 9 && curr_rotation === shape_rotations[h_up]){
                x_ctr = - 1;
            }
        }
        else if(shape === 'z'){
            /* Left Wall - is block leaning the left wall checker */
            if (tetromino_coords[2].x === 0 && curr_rotation === shape_rotations[h_down]) {
                x_ctr = 1;
            }
            /* Right Wall - is block leaning the right wall checker */
            else if(tetromino_coords[2].x === 9 && curr_rotation === shape_rotations[h_up]){
                x_ctr = - 1;
            }
        }
        else if(shape === 'j'){
            /* Left Wall - is block leaning the left wall checker */
            if(tetromino_coords[2].x === 0 && curr_rotation === shape_rotations[h_down]){
                x_ctr = 1;
            }
            /* Right Wall - is block leaning the right wall checker */
            else if(tetromino_coords[2].x === 9 && curr_rotation === shape_rotations[h_up]){
                x_ctr = - 1;
            }
        }
        else if(shape === 'l'){
            /* Left Wall - is block leaning the left wall checker */
            if(tetromino_coords[1].x === 0 && curr_rotation === shape_rotations[h_down]){
                x_ctr = 1;
            }
            /* Right Wall - is block leaning the right wall checker */
            else if(tetromino_coords[1].x === 9 && curr_rotation === shape_rotations[h_up]){
                x_ctr = - 1;
            }
        }
        else if(shape === 't'){
            /* Left Wall - is block leaning the left wall checker */
            if(tetromino_coords[1].x === 0 && curr_rotation === shape_rotations[h_down]){
                x_ctr = 1;
            }
            /* Right Wall - is block leaning the right wall checker */
            else if(tetromino_coords[1].x === 9 && curr_rotation === shape_rotations[h_up]){
                x_ctr = - 1;
            }
        }

        return x_ctr;
    }
});