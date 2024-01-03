// An arrow function returning an arrow function 
export const catchAsyncError = (passedFunction) => (req, res, next) => {
    Promise.resolve(passedFunction(req, res, next)).catch(next);
}