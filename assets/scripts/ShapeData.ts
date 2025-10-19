// Scripts/ShapeData.ts

// Định nghĩa các hình dạng bằng mảng 2D. Số 1 là có block, 0 là trống.
export const SHAPES = {
    // Chữ O (vuông 2x2)
    O: [
        [1, 1],
        [1, 1]
    ],
    // Chữ I (thanh dài 4 ô)
    I: [
        [1],
        [1],
        [1],
        [1]
    ],
    // Chữ T
    T: [
        [1, 1, 1],
        [0, 1, 0]
    ],
    // Chữ L
    L: [
        [1, 0],
        [1, 0],
        [1, 1]
    ],
    // Chữ J (L ngược)
    J: [
        [0, 1],
        [0, 1],
        [1, 1]
    ],
    // Chữ S
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ],
    // Chữ Z (S ngược)
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ],
    // Khối 1x1
    SINGLE: [
        [1]
    ]
};

// Lấy danh sách tên các hình dạng để chọn ngẫu nhiên
export const SHAPE_KEYS = Object.keys(SHAPES);