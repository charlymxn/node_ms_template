const { poolPromise } = require('./db');

exports.get_demo = async (req, res) => {
    try {
       
    } catch(error) {
        res.send(error);
    }  
    res.json("hello");
}

exports.add_demo = async (req, res) => {
    try {
       
    }
    catch(error) {
        console.log(error);
    };
    res.status(200).send('All ok');
}


exports.delete_demo = async (req, res) => {
    console.log('Deleting leads');
    try {
       
        res.status(200).send("Success: all demos deleted");
    } catch(error) {
        res.send(error);
    }
    
}


exports.generate_demo = async (req, res) => {
    try {
       
        res.status(200).send("Success");
    } catch (error) {
        res.json(error);

    }
};