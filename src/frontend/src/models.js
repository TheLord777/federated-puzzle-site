export const PUZZLE_VARIANT = {
  X_SUDOKU: "x-sudoku",
  CLASSIC: "sudoku",
};

export function isXVariantCell(variant, rowIndex, columnIndex){
    return variant == PUZZLE_VARIANT.X_SUDOKU && (rowIndex == columnIndex || rowIndex + columnIndex == 8) 
}
