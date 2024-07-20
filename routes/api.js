'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  // Get the sudoku solver.
  const solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {

      // Inputs.
      const puzzle = req.body.puzzle;
      const coord = req.body.coordinate;
      const val = req.body.value;

      // Check input fields exist.
      if (puzzle==undefined | coord==undefined | val==undefined ) return res.json({ "error": "Required field(s) missing" });

      // Test the inputs are valid.
      const reCoord = /^([A-Ia-i])([1-9])$/;
      const reVal = /^[1-9]$/;
      const rePuz = /[^1-9\.]/;
      if (!reCoord.test(coord)) return res.json({ "error": "Invalid coordinate" });
      if (!reVal.test(val)) return res.json({ "error": "Invalid value" });
      if (puzzle.length != 81) return res.json({ "error": "Expected puzzle to be 81 characters long" });
      if (rePuz.test(puzzle)) return res.json({ "error": "Invalid characters in puzzle" });
      
      // Get the coordinate representation of the row and column.
      const [_, row, col] = coord.match(reCoord);
      
      // Test the value is already in that coordinate of the puzzle.
      if (solver.checkDuplicateValue(puzzle,row ,col, val)) return res.json({ "valid": true });

      // Determine if the value violates the row, column, and region sudoku rules.
      const validRow = solver.checkRowPlacement(puzzle,row ,col, val);
      const validCol = solver.checkColPlacement(puzzle, row, col, val);
      const validReg = solver.checkRegionPlacement(puzzle, row ,col, val);
      if (validRow & validCol & validReg) return res.json({ "valid": true });

      // Determine the conflicts (if they exist).
      const conflict = [];
      if (!validRow) conflict.push("row");
      if (!validCol) conflict.push("column");
      if (!validReg) conflict.push("region");

      return res.json({ "valid": false, conflict });
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      // Inputs.
      const puzzle = req.body.puzzle;

      // Error if no puzzle is defined.
      if (puzzle == undefined) return res.json({error: 'Required field missing'});
      
      // Error if the puzzle has too many characters.
      if (puzzle.length != 81) return res.json({ "error": "Expected puzzle to be 81 characters long" });

      // Error if the puzzle contains invalid characters.
      const rePuz = /[^1-9\.]/;
      if (rePuz.test(puzzle)) return res.json({ "error": "Invalid characters in puzzle" });

      // Try to solve the puzzle.
      const puzzleArr = [...puzzle];
      // Error if it does not solve.
      if (!solver.solve(puzzleArr)) return res.json({ "error": "Puzzle cannot be solved" });
      // Return the solution.
      return res.json({ "solution":  puzzleArr.join("")});
    });
};