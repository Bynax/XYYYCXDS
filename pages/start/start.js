//login.js
//获取应用实例
//var Bmob = require("../../utils/bmob.js");

//Bmob.initialize("22829d99ea5d02e61b348a46fbc4f201", "dc50a249d7f86ea291eecd30eaeb9c20");
var app = getApp();
Page({
  data: {
    remind: '加载中',
    angle: 0,
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  goToIndex: function () {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
  bindGetUserInfo: function (e) {
    //判断授权
    if (!e.detail.userInfo) {
      console.log("授权失败")
    } else {
      // try {
      //   var value = wx.getStorageSync('user_openid')
      //   if (value) {
      //       //todo nothing
      //   } else {
      //     console.log('执行login1')
      //     // wx.login({
      //     //   success: function (res) {
      //     //     if (res.code) {
      //     //       console.log('执行login2', res);
      //     //     }
      //     //   }
      //     // });
      //     wx.login({
      //       success: function (res) {
      //         if (res.code) {
      //           Bmob.User.requestOpenId(res.code, {
      //             success: function (userData) {
      //               wx.getUserInfo({
      //                 success: function (result) {
      //                   var userInfo = result.userInfo
      //                   var nickName = userInfo.nickName
      //                   var avatarUrl = userInfo.avatarUrl
      //                   var sex = userInfo.gender
      //                   Bmob.User.logIn(nickName, userData.openid, {
      //                     success: function (user) {
      //                       try {
      //                         wx.setStorageSync('user_openid', user.get('userData').openid)
      //                         wx.setStorageSync('user_id', user.id)
      //                         wx.setStorageSync('my_nick', user.get("nickname"))
      //                         wx.setStorageSync('my_username', user.get("username"))
      //                         wx.setStorageSync('my_sex', user.get("sex"))
      //                         wx.setStorageSync('my_avatar', user.get("userPic"))
      //                       } catch (e) { }
      //                       console.log("登录成功");
      //                     },
      //                     error: function (user, error) {
      //                       if (error.code == '101') {
      //                         var user = new Bmob.User(); //开始注册用户
      //                         user.set('username', nickName);
      //                         user.set('password', userData.openid);
      //                         user.set("nickname", nickName);
      //                         user.set("userPic", avatarUrl);
      //                         user.set("userData", userData);
      //                         user.set('sex', sex);
      //                         user.set('feednum', 0);
      //                         user.signUp(null, {
      //                           success: function (result) {
      //                             console.log('注册成功');
      //                             try { //将返回的3rd_session存储到缓存中
      //                               wx.setStorageSync('user_openid', user.get('userData').openid)
      //                               wx.setStorageSync('user_id', user.id)
      //                               wx.setStorageSync('my_nick', user.get("nickname"))
      //                               wx.setStorageSync('my_username', user.get("username"))
      //                               wx.setStorageSync('my_sex', user.get("sex"))
      //                               wx.setStorageSync('my_avatar', user.get("userPic"))
      //                             } catch (e) { }
      //                           },
      //                           error: function (userData, error) {
      //                             console.log("openid=" + userData);
      //                             console.log(error)
      //                           }
      //                         });

      //                       }
      //                     }
      //                   });
      //                 }
      //               })
      //             },
      //             error: function (error) {
      //               console.log("Error: " + error.code + " " + error.message);
      //             }
      //           });
      //         } else {
      //           console.log('获取用户登录态失败1！' + res.errMsg)
      //         }
      //       },
      //       complete: function (e) {
      //         console.log('获取用户登录态失败2！' + e)
      //       }
      //     });
      //   }
      // } catch (e) {
      //   console.log("登陆失败")
      // }
      // var value = wx.getStorageSync('user_openid')

      //当授权成功后，直接调用登录接口，获取code；
      wx.login({
        success: function (res) {
          if (res.code) {
            wx.getUserInfo({
              success:function(result){
                app.globalData.userInfo = result.userInfo;
                //console.log(app.globalData.userInfo.nickname)
                var userInfo = result.userInfo
                var nickName = userInfo.nickName
                var avatarUrl = userInfo.avatarUrl
                var sex = userInfo.gender

                //wx.setStorageSync('user_openid', user.get('userData').openid)
                //wx.setStorageSync('user_id', user.id)
                wx.setStorageSync('my_nick', nickName)
                wx.setStorageSync('my_sex', sex)
                wx.setStorageSync('my_avatar', avatarUrl)
                console.log(nickName)
                wx.switchTab({
                  url: '/pages/index/index',
                })

              }
            })
            
          } else {
            wx.showToast({
              title: '登录失败',
              icon: 'none',
            })
          }
        }
      });
    }
  },
  onLoad: function () {
    // //判断是否有授权
    // wx.getSetting({
    //   success(res) {
    //     if (res.authSetting['scope.userInfo']) {
    //       wx.getUserInfo({
    //         success: function (resuser) {
    //           wx.login({
    //             success: function (wxres) {
    //               if (wxres.code) {
    //                 //进入到TAB页面
    //                 // wx.switchTab({
    //                 //   url: '/pages/index/index',
    //                 // })
    //               } else {
    //                 wx.showToast({
    //                   title: '登录失败',
    //                   icon: 'none',
    //                 })
    //               }
    //             }
    //           });
    //         }
    //       })
    //     } else {
    //       console.log("没有授权啊啊啊");
    //     }
    //   }
    // })
  },

  onShow: function () {
    // console.log('onLoad')
    // var that = this
    // // app.getUserInfo(function (userInfo) {
    // //   that.setData({
    // //     userInfo: userInfo
    // //   })
    // // })
  },
  onReady: function () {
    var _this = this;
    setTimeout(function () {
      _this.setData({
        remind: ''
      });
    }, 1000);
    wx.onAccelerometerChange(function (res) {
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