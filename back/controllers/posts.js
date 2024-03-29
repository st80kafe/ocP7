const jwt = require("jsonwebtoken");
const pool = require('../middleware/database');
require("dotenv").config();
exports.createPost = async (req, res) => {
    if ( typeof req.body !== null ){
        const body = req.body;
        if ( req.file ){
            body.filepath = req.file.filename
        }
        const url = req.protocol + '://' + req.get('host');
        const imgpath = url + '/images/';
        let sql = 'SELECT description FROM posts WHERE name = ? and topic = ? and description = ?'
        await pool.query(
            sql,
            [
            body.name,
            body.topic,
            body.description
            ],
            (error, postData) => {
                if (error){
                    return res.status(401).json({error: error});
                }
                if (postData.length > 0 ){
                    res.status(400).json({error:"duplicate post"});
                } else {
                    sql = 'INSERT INTO posts( userID, name, topic, description, url, filepath) VALUES( ?, ?, ?, ?, ?, ?)'
                    pool.query(
                        sql,
                        [
                        body.id,
                        body.name,
                        body.topic,
                        body.description,
                        body.url,
                        body.filepath,
                        ],
                        (error) => {
                            if (error){
                                return res.status(401).json({error: error});
                            }else{
                                console.log(`Successful post made by ${body.id}`);
                                res.status(200).json({
                                    message: 'post created successfully!'
                            });
                        }
                    });
                }
            }
        )
    }
};
exports.recentPost = async (req, res) => {
    let sql = 'select postID, topic, time_created, description, url, filepath from posts where userID = ? order by time_created desc limit ' + req.query.p 
    pool.query(
        sql,
        [req.params.id],
        (error, userData) => {
            if (error){
                return res.status(401).json({error: error});
            }else if( userData.length > 0 && userData.rowCount != 0 ){
                limit = 'more';
                if ( userData.length == req.query.p ){
                    result = req.query.p - 1
                } else {
                    limit = 'end';
                    result = userData.length - 1;
                }
                pd = `${userData[result].time_created}`.split(' ')
                postdate = pd[0] + ' ' + pd[1] + ' ' +  pd[2] + ' ' + pd[4];
                console.log(`Data requested for user: ${req.params.id} ${postdate}`)
                res.status(200).json({
                    id:userData[result].postID, Topic:userData[result].topic, Date:postdate,  description:userData[result].description, filepath:userData[result].filepath, url:userData[result].url, Limit:limit
                });
            } else {
                if ( userData.length === 0 ) {
                    res.status(200).json({
                        message:"no posts yet"
                    })
            }
        }
    })
};
exports.singlePost = async (req, res) => {
    let sql = 'select * from posts where postID = ? '
    pool.query(
        sql,
        [req.params.id],
        (error, userData) => {
            if (error){
                return res.status(401).json({error: error});
            } else if ( userData.length > 0 && userData.rowCount != 0 ){
                res.status(200).json({
                    userData
                });   
            } else {
                if ( userData.length === 0 ) {
                    res.status(404)
            }
        }
    })
};
exports.allPosts = async (req, res) => {
    let sql = 'select postID, userID, name, topic, description, url, filepath, time_created from posts order by time_created desc limit 20'
    pool.query(
        sql,
        (error, userData) => {
            if (error){
                return res.status(401).json({error: error});
            } else if ( userData.length > 0 && userData.rowCount != 0 ){
                res.status(200).json({
                    userData
                });   
            } else {
                if ( userData.length === 0 ) {
                    res.status(404)
            }
        }
    })
};
exports.unread = async (req, res) => {
    let sql = 'select postID from read_posts where userID = ?'
    pool.query(
        sql,
        [
            req.params.id
        ],
        (error, userData) => {
            if (error){
                return res.status(401).json({error: error});
            } else if ( userData.length > 0 && userData.rowCount != 0 ){
                res.status(200).json({
                    userData
                });   
            } else {
                if ( userData.length === 0 ) {
                    res.status(404)
            }
        }
    })
}
exports.wasRead = async (req, res) => {
    let sql = 'insert into read_posts values ( ?, ? )'
    pool.query(
        sql,
        [
            req.params.id, 
            req.query.p,
        ],
        (error) => {
            if (error){
                if ( error.code === 'ER_DUP_ENTRY'){
                    return res.status(204);
                } else {
                    return res.status(401).json({error: error});
                }
            } else {
                res.status(200).json({
                    message: `post ${req.query.p} read by ${req.params.id}`
                });   
            } 
    })
}
