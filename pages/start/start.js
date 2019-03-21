//login.js
//获取应用实例
wx.clearStorage();
var Bmob = require("../../utils/bmob.js");
Bmob.initialize("b50831e8a77f6b9a3b0cf69e4eb3806c", "10de7e320051c765fb8a341cc7cd720c");
var app = getApp();
Page({
  data: {
    remind: '加载中',
    angle: 0,
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },

  goToIndex: function() {
    wx.navigateTo({
      url: '/pages/index/index',
    })
  },
  bindGetUserInfo: function(e) {
    //判断授权
    if (!e.detail.userInfo) {
      console.log("授权失败")
    } else {
      try {
        app.userInfo = e.detail.userInfo;
        var value = wx.getStorageSync('user_openid')
        if (value) {
        } else {
          wx.login({
            success: function(res) {
              if (res.code) {
                Bmob.User.requestOpenId(res.code, {
                  success: function(userData) {
                    wx.getUserInfo({
                      success: function(result) {
                        var userInfo = result.userInfo
                        var nickName = userInfo.nickName
                        var avatarUrl = userInfo.avatarUrl
                        Bmob.User.logIn(nickName, userData.openid, {
                          success: function(user) {
                            try {
                              wx.setStorageSync('user_openid', user.get('userData').openid)
                              wx.setStorageSync('user_id', user.id)
                              wx.setStorageSync('my_nick', user.get("nickname"))
                              wx.setStorageSync('my_username', user.get("username"))
                              wx.setStorageSync('my_avatar', user.get("userPic"))
                              wx.setStorageSync('my_auth', user.get('auth1'))
                              wx.switchTab({
                                url: '/pages/index/index',
                              });
                            } catch (e) {}
                            console.log(wx.getStorageSync("my_auth"))
                            console.log("登录成功");
                            //console.log("error\t"+e.message+"\t"+e.name)
                          },
                          error: function(user, error) {
                            if (error.code == '101') {
                              var user = new Bmob.User(); //开始注册用户
                              user.set('username', nickName);
                              user.set('password', userData.openid);
                              user.set("nickname", nickName);
                              user.set("userPic", avatarUrl);
                              user.set("userData", userData);
                              user.set("auth1", 2)
                              user.signUp(null, {
                                success: function(result) {
                                  console.log('注册成功');
                                  try { //将返回的3rd_session存储到缓存中
                                    wx.setStorageSync('user_openid', user.get('userData').openid)
                                    wx.setStorageSync('user_id', user.id)
                                    wx.setStorageSync('my_nick', user.get("nickname"))
                                    wx.setStorageSync('my_username', user.get("username"))
                                    wx.setStorageSync('my_avatar', user.get("userPic"))
                                    wx.setStorageSync('my_auth', user.get("auth1"))
                                    wx.switchTab({
                                      url: '/pages/index/index',
                                    });
                                  } catch (e) {}
                                },
                                error: function(userData, error) {
                                  console.log("openid=" + userData);
                                  console.log(error)
                                }
                              });

                            }
                          }
                        });
                      }
                    })
                  },
                  error: function(userData, error) {
                    console.log("Error: " + error.code + " " + error.message);
                  }
                });
              } else {
                console.log('获取用户登录态失败1！' + res.errMsg)
              }
            },
            complete: function(e) {
              //console.log('获取用户登录态失败2！' + e)
            }
          });
        }
      } catch (e) {
        console.log("登陆失败")
      }
    }
  },

onLoad:function(){
  wx.clearStorage()

},
  onReady: function() {
    var _this = this;
    setTimeout(function() {
      _this.setData({
        remind: ''
      });
    }, 1000);
    wx.onAccelerometerChange(function(res) {
      var angle = -(res.x * 30).toFixed(1);
      if (angle > 14) {
        angle = 14;
      } else if (angle < -14) {
        angle = -14;
      }
      if (_this.data.angle !== angle) {
        _this.setData({
          angle: angle
        });
      }
    });
  },
});