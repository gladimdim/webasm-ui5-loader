extern crate cfg_if;
extern crate wasm_bindgen;

mod utils;

use cfg_if::cfg_if;
use wasm_bindgen::prelude::*;

cfg_if! {
    // When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
    // allocator.
    if #[cfg(feature = "wee_alloc")] {
        extern crate wee_alloc;
        #[global_allocator]
        static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
    }
}

#[wasm_bindgen]
pub fn add_two(a: i32, b: i32) -> i32 {
    a + b
}

#[wasm_bindgen]
pub fn multiply_by(a: i32, b: i32) -> i32 {
    a * b
}

#[wasm_bindgen]
pub fn sum_array(input: Vec<u32>) -> u32 {
    input.iter().sum()
}
