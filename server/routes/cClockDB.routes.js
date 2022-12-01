const UserController = require('../controllers/user.controller');
const ClockController = require('../controllers/clock.controller');

module.exports = (app) => {
    //Routes for Clock
    app.post('/api/clock/in',ClockController.punchIn);
    app.post('/api/clock/out',ClockController.punchOut);
    app.get('/api/clock/punches',ClockController.employeePunches);

    //User routes
    app.post("/register", UserController.register);
    app.post("/login", UserController.login);
    app.post("/logout", UserController.logout);
    app.get("/user", UserController.getLoggedInUser);
    app.put('/user/:id', UserController.update);

    //Protected routes
    app.post("/verify/:id", UserController.verify);
    app.get("/users", UserController.getUsers);
    app.delete('/user/:id', UserController.deleteUser);
};