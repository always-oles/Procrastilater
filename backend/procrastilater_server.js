const helmet        = require('helmet');
const bodyParser    = require('body-parser');
const User          = require('./models/User.js');
const Message       = require('./models/Message.js');
const express       = require('express');
const app           = express();
const mongoose      = require('mongoose');
const path          = require('path');
const cookieParser  = require('cookie-parser');

// mongoose basic setup, thanks stack overflow
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/Procrastilater', {
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE,
  useMongoClient: true
});

// middlewares
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

let router = express.Router();

/*
 * Aggregate stats from db and return as json to app
 */
const aggregateAndReturnStats = (response) => {
    User.aggregate([
        { $match: { deleted: {$ne: 1 } }},
        {
            $group: { 
                _id: null, 
                totalBookmarks: { 
                    $sum: '$stats.bookmarksCount' 
                },
                totalPostponed: { 
                    $sum: '$stats.bookmarksPostponed' 
                },
                totalVisited: {
                    $sum: '$stats.bookmarksVisited'
                },
                totalVisitedManually: {
                    $sum: '$stats.bookmarksVisitedManually'
                },
                count: {
                    $sum: 1
                }
            }
        }
    ], (error, result) => {
        response.json(result[0]);
    });
};

/**
 * When user gets his stats updated or upon page reload - update 
 * his stats in db and send him a new total stats aggregated
 */
router.route('/stats')
    .post( (request, response) => { 

        // check if token is passed
        if (request.body.token) {

            // transform into integers
            if (request.body.stats) {
                for (let i in request.body.stats) {
                    request.body.stats[i] = parseInt(request.body.stats[i]);
                }
            }

            // try to find an existing user by token
            User.findOne({
                token: request.body.token
            }, (error, user) => {
                if (error) return response.json({ status: 'Error', message: 'Something went wrong' });
                
                // if user has been found - update the model
                if (user) {
                    user.name         = request.body.name;
                    user.achievements = request.body.achievements;
                    user.stats        = request.body.stats;
                    user.lastUpdate   = Date.now();

                    // save updated user
                    user.save(() => {
                        aggregateAndReturnStats(response);
                    });            
                } else {
                    // create new user
                    new User(request.body).save(() => {
                        aggregateAndReturnStats(response);
                    });
                }
            });

        } else {
            response.json({ status: 'Error', message: 'Token is needed' });
        }
    });

/**
 * If user sends message from extension
 */
router.route('/sendMessage')
    .post((request, response) => {
        // new message entity
        let message = new Message(request.body);

        // save it
        message.save((error) => {
            if (error) return response.send(error);
            response.json({ status: true });
        });
});

app.use('/pl/api', router);

/**
 * If user decided to uninstall the extension - he is directed to this page
 */
app.get('/pl/uninstall', (request, response) => {
    User.findOne({ token: request.cookies.token }, (error, user) => {
        if (user) {
            user.deleted = 1;
            user.save();            
        }

        response.sendFile(path.join(__dirname, 'public', 'uninstall.html'));
    });
});

// serve favicon
app.use('/pl/favicon.ico', express.static('public/favicon.ico'));
app.listen(8081, () => console.log('server started'));