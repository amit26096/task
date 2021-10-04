const mysql = require("mysql");

//connectio pool
const pool = mysql.createPool({connectionLimit: 100, host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASS, database: process.env.DB_NAME});

//view users
exports.view = (req, res) => {
  //Route
  //connect to db
  pool.getConnection((err, connection) => {
    if (err) 
      throw err;
    console.log("Connected as ID:" + connection.threadId);

    //user the connection
    connection.query("SELECT * FROM subject", (err, rows) => {
      connection.release();

      if (!err) {
        res.render("home", {rows});
      } else {
        console.log("sorry try again");
      }

      console.log("data from the database : \n", rows);
    });
  });
};

//Profile page
exports.profile = (req, res) => {
  res.render("profile");
};

//Showing market list
exports.market = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) 
      throw err;
    console.log("connected as id :" + connection.threadId);

    connection.query("select * from banks", (err, rows) => {
      connection.release();

      if (!err) {
        res.render("market-list", {rows});
      } else {
        console.log("sorry");
      }
    });
  });
};

//Profile page
exports.profile = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) 
      throw err;
    connection.query("SELECT * FROM profile", (err, rows) => {
      connection.release();
      if (!err) {
        res.render("profile", {rows});
      }
    });
  });
};

//Insert bought details
exports.insert = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;

    let num_share = req.body.num_share;
    let id = req.body.b_name;
    // console.log(num_share);
    // console.log(id);

    connection.query("select * from banks where id = ?", [id], (err, rows) => {
      connection.release();

      if (!err) {
        pool.getConnection((err, connection) => {
          if (err) throw err;
          
          //Insert bought bank details into Bought table
          connection.query("INSERT into bought set name = ?, per_s_cost = ?, stock_amt = ?, amount = ?", [
            rows[0].name,
            rows[0].per_s_price,
            num_share,
            rows[0].per_s_price * num_share//To use at the decrement of the total money
          ], (err, row) => {
            connection.release();
            if (!err) {
              // console.log(rows[0].available_stock);
              pool.getConnection((err, connection) => {
                if (err) 
                  throw err;
                
                //To update the total number of available stock
                connection.query("UPDATE banks set available_stock = ? where id = ?", [
                  rows[0].available_stock - num_share,
                  id
                ], (err, ro) => {
                  connection.release();
                  if (!err) {
                    // res.redirect("/");
                    pool.getConnection((err, conne) =>{
                      if (err) throw err;
                      conne.query('SELECT * FROM profile', (err, r) =>{
                        conne.release();
                        let b_amt = r[0].amount;
                        if(!err){
                          pool.getConnection((err, co) =>{
                            if (err) throw err;
                            co.query('UPDATE profile set amount = ? where id = ?',[b_amt - (rows[0].per_s_price * num_share), 1], (err, success) =>{
                              co.release();
                              if(!err){
                                res.redirect("/");

                              }
                              

                            })

                          })
                        }
                      })
                    })
                  }
                });
              });
            }
          });
        });
      } else {
        console.log("sorry");
      }
    });
  });
};

// To show the Bought Details in Dashboard Modal
exports.dash = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) 
      throw err;
    
    connection.query("SELECT * FROM bought", (err, rows) => {
      connection.release();
      if (!err) {
        res.render("dashboard", {rows});
      }
    });
  });
};

// To Sell the bouhgt shares
exports.sell = (req, res) => {

  pool.getConnection((err, connection) => {
    if (err) 
      throw err;
    
    // console.log(req.params.id);
    connection.query("SELECT * from bought where id = ?", [req.params.id], (err, rows) => {
      connection.release();
      if (!err) {
        let amt = rows[0].amount;
        pool.getConnection((err, conne) => {
          if (err) 
            throw err;
          conne.query("select * from profile", (err, r) => {
            if (!err) {
              let a = r[0].amount;

              pool.getConnection((err, connection) => {
                if (err) 
                  throw err;
                connection.query("UPDATE profile set amount = ? where id = ?", [
                  amt + a, 1
                ], (err, row) => {
                  connection.release();
                  if (!err) {
                    pool.getConnection((err, conn) => {
                      if (err) 
                        throw err;
                      conn.query("DELETE from bought where id = ?", [req.params.id], (err, ro) => {
                        conn.release();
                        if (!err) {
                          res.redirect("/");
                        }
                      });
                    });
                  }
                });
              });
            }
          });
        });
      }
    });
  });
};
