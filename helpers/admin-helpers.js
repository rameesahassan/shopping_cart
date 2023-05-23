var db = require("../config/connection");
var collection = require("../config/collection");
//const objectId = require('mongodb').ObjectId
const bcrypt = require("bcrypt");
const saltRounds = 10;
module.exports = {
  doSignup: (adminData) => {
    return new Promise(async (resolve, reject) => {
      adminData.password = await bcrypt.hash(adminData.password, saltRounds);

      db.get()
        .collection(collection.ADMIN_COLLECTION)
        .insertOne(adminData)
        .then((data) => {
          resolve(data.insertedId);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  doLogin: (adminData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let admin = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ email: adminData.email })
        .catch((err) => {
          reject(err);
        });
      if (admin) {
        bcrypt.compare(adminData.password, admin.password).then((status) => {
          if (status) {
            response.admin = admin;
            response.status = true;
            resolve(response);
          } else {
            resolve({ status: false });
          }
        });
      } else {
        resolve({ status: false });
      }
    });
  },
  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .find()
          .toArray();
        resolve(orders);
      } catch (error) {
        reject(error);
      }
    });
  },
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();

      resolve(users);
    });
  },
};
