/*eslint fp/no-unused-expression: 0, fp/no-nil: 0 */
import sum from "./sum";

describe("it is a function that adds ", () => {
    it("adds 1 and 2", () => {
        expect(sum(1, 2)).toBe(3);
    });
});
