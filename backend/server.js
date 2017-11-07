const helmet        = require('helmet');
const bodyParser    = require('body-parser');
const User          = require('./models/user.js');
const Message       = require('./models/message.js');
const express       = require('express');
const app           = express();
const mongoose      = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/Procrastilater', {
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE,
  useMongoClient: true
});

// middlewares
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var router = express.Router();

router.route('/sendMessage')
    .post( (request, response) => {
        let message = new Message(request.body);
        message.save((error) => {
            if (error) return response.send(error);

            response.json({ status: true });
        })
    });


// router.route('/users')
//     .get((request, res) => {
//         res.json('hey user');
//     });

app.use('/api', router);
app.listen(3000, () => console.log('server started'));