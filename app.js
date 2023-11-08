require("dotenv").config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order')
const OrderItem = require('./models/order-item')
const PORT = process.env.PORT || 3000;
const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
app.use(bodyParser.urlencoded({ extended: false }));
console.log(path.join(__dirname,'public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(async (req, res, next) => {
  try{
    let user =await  User.findByPk(1)
      req.user = user;
      next();
  }
  catch(err)
  {
    res.status(500)
    .json({message : "user not created, some error is happned"})}
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);
// why we need this contsrains and  ondelete.
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product , {through : OrderItem})


sequelize
  // .sync({ force: true })
  .sync()
  .then(result => {
    return User.findOne({where :{id : 1}});
    // console.log(result);
  })
  .then(user => {
    if (!user) {
      return User.create({ name: 'Max', email: 'test@test.com' });
    }
    return user;
  })
  .then(user => {
    return user.createCart();
  })
  .then(cart => {
    app.listen(PORT);
  })
  .catch(err => {
    console.log(err);
  });
