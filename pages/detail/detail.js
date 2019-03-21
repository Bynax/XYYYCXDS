var common = require('../template/getCode.js');
var Bmob = require("../../utils/bmob.js");
var util = require('../../utils/util.js');
import { $wuxButton } from '../../components/wux'
var app = getApp();
var that;
var showView;
var optionId; //活动的Id
var publisherId; //活动发布者的Id
Page({
  data: {
    showView:true,
    showViewall:true,
    accounts: ["手机号", "微信号", "QQ号"],
    accountIndex: 0,
    actStatusArray: ["准备中", "进行中", "已结束"],
    statusIndex: 0,
    realname: "",
    contactValue: "",
    showTopTips: false, //是否显示提示
    TopTips: '', //提示的内容

    //----------------
    tag_select: 0,
    limit: 5,
    loading: false,
    isdisabled: false,
    commentLoading: false,
    isdisabled1: false,
    isMe: false,
    isToResponse: false,
    //status: 0,//tab切换按钮
    discription: "",
    adminId: "",
    adminname: "",
    adcontactWay: "",
    adcontactValue: "",
    index: 2,
    opened: !1,
    style_img: ''
  },

  //打开发布者联系方式弹窗
  showmainLink: function () {
    this.setData({
      linkmainHe: true
    })
  },
  //关闭发布者联系方式弹窗
  closemainLink: function () {
    this.setData({
      linkmainHe: false
    })
  },

  //复制联系方式
  copyLink: function (e) {
    var value = e.target.dataset.value;
    wx.setClipboardData({
      data: value,
      success() {
        common.dataLoading("复制成功", "success");
        console.log('复制成功')
      }
    })
  },

  //切换tab操作
  changePage: function (e) {
    let id = e.target.id;
    this.setData({
      status: id
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    var openid = wx.getStorageSync("user_openid");
    var auth = wx.getStorageSync("my_auth");
    if (auth == 2) {
      that.setData({ showViewall: false });
    }
    if(auth==1){
      that.setData({ showView: true});
    }else if(auth==0){
      that.setData({ showView: false });
    }
    
    // console.log("show:"+showView)
    optionId = options.actid;
    publisherId = options.pubid;
    wx.getStorage({ //判断当前发布人是不是自己
      key: 'user_id',
      success: function (ress) {
        if (publisherId == ress.data) {
          that.setData({
            isMe: true,
          })
          console.log("这是我的发起");
        }
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideToast()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var myInterval = setInterval(getReturn, 500);//半秒定时查询
    var auth = wx.getStorageSync("my_auth");
    if (auth == 2) {
      that.setData({ showViewall: false });
    }
    if (auth == 1) {
      that.setData({ showView: true })
    } else if(auth==0) {
      that.setData({ showView: false });
    }
    function getReturn() {
      wx.getStorage({
        key: 'user_id',
        success: function (ress) {
          if (ress.data) {
            clearInterval(myInterval); //清除定时器

            //查询活动信息
            var Diary = Bmob.Object.extend("Events");
            var query = new Bmob.Query(Diary);
            query.equalTo("objectId", optionId);
            query.include("publisher");
            query.find({
              success: function (result) {
                var title = result[0].get("title");
                var content = result[0].get("content");
                var publisher = result[0].get("publisher");
                var acttype = result[0].get("acttype");
                var acttypename = getTypeName(acttype);
                var endtime = result[0].get("endtime");
                var createdAt = result[0].createdAt;
                var pubtime = util.getDateDiff(createdAt);
                var address = result[0].get("address");
                var longitude = result[0].get("longitude");//经度
                var latitude = result[0].get("latitude");//纬度
                var peoplenum = result[0].get("num_limit");
                var publisherName = publisher.nickname;
                var objectIds = publisher.objectId;
                var discription = result[0].get("discription");
                console.log(publisher.username)
                var publisherPic;
                var url;
                if (publisher.userPic) {
                  publisherPic = publisher.userPic;
                }
                else {
                  publisherPic = "/static/images/icon/user_defaulthead@2x.png";
                }
                if (publisher.id == ress.data) {
                  that.setData({
                    isMine: true
                  })
                } that.setData({
                  listTitle: title,
                  publishTime: pubtime,
                  acttype: acttype,
                  acttypename: acttypename,
                  endtime: endtime,
                  address: address,
                  longitude: longitude,//经度
                  latitude: latitude,//纬度
                  peoplenum: peoplenum,
                  publisherPic: publisherPic,
                  publisherName: publisherName,
                  objectIds: objectIds,
                  loading: true,
                  discription: discription
                })
              },
              error: function (error) {
                that.setData({
                  loading: true
                })
                console.log(error);
              }
            })
          }
        },
      })
    }
  },

  submit_summary:function(){
    wx.showModal({
      title: '提示',
      content: '此功能待完善！',
      showCancel: false,
      success: function (e) {
        // if (true) {
        //   wx.switchTab({
        //     url: '../index/index',
        //   });
        // }
      }
    })
console.log("hello")
  },

  //----------------------------------




  bindKeyInput: function (e) {
    this.setData({
      publishContent: e.detail.value
    })
  },
  

  //查看活动地图位置
  viewActAddress: function () {
    let latitude = this.data.latitude;
    let longitude = this.data.longitude;
    wx.openLocation({ latitude: latitude, longitude: longitude })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log(this.data.listTitle);
    return {
      title: this.data.listTitle,
      path: '/pages/detail/detail?actid=' + optionId + "&pubid" + publisherId,
      imageUrl: this.data.istPic,
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: '转发成功',
          icon: 'success'
        });
      },
      fail: function (res) {
        // 转发失败
        wx.showToast({
          title: '转发失败',
          icon: 'fail'
        });
      }
    }
  },


  //关闭弹出联系表单
  closeJoin: function () {
    this.setData({
      showDialog: !this.data.showDialog
    });
  },

  //关闭修改联系信息弹窗
  closeUpdJoin: function () {
    this.setData({
      showUpdDialog: false
    });
  },

  //关闭弹出改变状态表单
  closeChange: function () {
    this.setData({
      showStuDialog: false
    });
  },

  //改变发起状态index
  changeStatus: function (e) {
    this.setData({
      statusIndex: e.detail.value
    })
  },

  //改变联系方式
  bindAccountChange: function (e) {
    this.setData({
      accountIndex: e.detail.value
    })
  },
  //改变修改信息时的联系方式
  updjoinChange: function (e) {
    this.setData({
      jocountIndex: e.detail.value
    })
  },

  //改变活动状态操作
  stuSubmit: function (event) {
    var statusIndex = that.data.statusIndex;
    if (statusIndex == 0) {
      var Statusname = "准备中";
    } else if (statusIndex == 1) {
      var Statusname = "进行中";
    } else if (statusIndex == 2) {
      var Statusname = "已结束";
    }
    var Diary = Bmob.Object.extend("EventMore");
    var query = new Bmob.Query(Diary);

    query.get(eventMoreId, {
      success: function (result) {
        result.set("Status", Number(statusIndex));
        result.set("Statusname", Statusname);
        result.save();
        // if (Statusname == "已结束") { //如果活动状态为已结束，该活动将撤离首页
        //   var Events = Bmob.Object.extend("Events");
        //   var evnet = new Bmob.Query(Events);
        //   evnet.get(optionId, {
        //     success: function (result) {
        //       result.set("isShow", 0);
        //       result.save();
        //       console.log("撤离成功");
        //     },
        //     error: function (object, error) {
        //       console.log("撤离失败" + error);
        //     }
        //   });
        // }
        that.setData({
          showStuDialog: false
        })
        console.log("改变状态成功");
        common.dataLoading("改变成功", "success");
      },
      error: function (object, error) {
        console.log("改变状态失败" + error);
      }
    });
    that.onShow();
  },


  //修改联系信息操作
  updSubmit: function (event) {
    var jocountIndex = that.data.jocountIndex;
    if (jocountIndex == 0) {
      var contactWay = "手机号";
    } else if (jocountIndex == 1) {
      var contactWay = "微信号";
    } else if (jocountIndex == 2) {
      var contactWay = "QQ号";
    }
    var realname = event.detail.value.joinname;
    var contactValue = event.detail.value.jocontactValue;
    var wxReg = new RegExp("^[a-zA-Z]{1}[-_a-zA-Z0-9]{5,19}$");
    var qqReg = new RegExp("[1-9][0-9]{4,}");
    var phReg = new RegExp("0?(13|14|15|17|18|19)[0-9]{9}");
    var nameReg = new RegExp("^[\u4e00-\u9fa5]{2,4}$");
    if (realname == "") {
      this.setData({
        showTopTips: true,
        TopTips: '请输入真实姓名'
      });
    } else if (realname != "" && !nameReg.test(realname)) {
      this.setData({
        showTopTips: true,
        TopTips: '真实姓名一般为2-4位汉字'
      });
    } else if (contactValue == "") {
      this.setData({
        showTopTips: true,
        TopTips: '请输入联系方式'
      });
    } else if (contactWay == "微信号" && !wxReg.test(contactValue)) {
      this.setData({
        showTopTips: true,
        TopTips: '微信号格式不正确'
      });
    } else if (contactWay == "手机号" && !phReg.test(contactValue)) {
      this.setData({
        showTopTips: true,
        TopTips: '手机号格式不正确'
      });
    } else if (contactWay == "QQ号" && !qqReg.test(contactValue)) {
      this.setData({
        showTopTips: true,
        TopTips: 'QQ号格式不正确'
      });
    } else {
      var Contacts = Bmob.Object.extend("Contacts");
      var contact = new Bmob.Query("Contacts");
      contact.get(joinpId, {
        success: function (result) {
          result.set("realname", realname);
          result.set("contactWay", contactWay);
          result.set("contactValue", contactValue);
          result.save({
            success: function () {
              //加入之后生成消息存在表中，默认未未读
              var isme = new Bmob.User();
              isme.id = wx.getStorageSync("user_id");
              var value = wx.getStorageSync("my_avatar")
              var my_username = wx.getStorageSync("my_username")
              var Plyre = Bmob.Object.extend("Plyre");
              var plyre = new Plyre();
              plyre.set("behavior", 7); //消息通知方式
              plyre.set("noticetype", "修改信息");
              plyre.set("bigtype", 1)//动态大类,通知类
              plyre.set("avatar", value); //我的头像
              plyre.set("username", my_username); // 我的名称
              plyre.set("uid", isme);
              plyre.set("wid", optionId); //活动ID
              plyre.set("fid", publisherId); //
              console.log("fid=" + publisherId)
              plyre.set("is_read", 0); //是否已读,0代表没有,1代表读了
              plyre.save();
              console.log("修改成功");
              common.dataLoading("修改成功", "success");
            }, error: function (error) {
              console.log("修改失败");
            }
          });
          that.onShow();
        },
      })
      that.setData({
        showUpdDialog: false
      })
    }
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 1000);
  },
   modify_info:function(){
     console.log("hello")
    let actid = optionId;
    let pubid = publisherId;
    console.log("actid1\t"+actid+"pubid\d"+pubid)
    if(this.data.isMe) { //如果是当前用户的发起
      wx.navigateTo({
        url: '/pages/updAct/updAct?actid=' + actid + "&pubid=" + pubid,
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您没有修改权限！',
        showCancel: false,
        success: function (e) {
          // if (true) {
          //   wx.switchTab({
          //     url: '../index/index',
          //   });
          // }
        }
      })
      this.setData({
        showUpdDialog: true
      })
    }
  },

  pass:function(){
    var Diary = Bmob.Object.extend("Events");
    var query = new Bmob.Query(Diary);
    console.log("optionid"+optionId)
    query.get(optionId,{
      success: function (result) {
        // 回调中可以取得这个 diary 对象的一个实例，然后就可以修改它了
        console.log("success")
        result.set('status', 1);
        result.save();
      },
      error: function (object, error) {
        console.log("fail")

      }
    }); 


  },
  
  refuse:function(){
    var Diary = Bmob.Object.extend("Events");
    var query = new Bmob.Query(Diary);
    query.equalTo("objectId", optionId);
    console.log("refuse")
    query.get({
      success: function (result) {
        // 回调中可以取得这个 diary 对象的一个实例，然后就可以修改它了
        result.set('status', 2);
        result.save();
        console.log("refuse success");
      },
      error: function (object, error) {
        console.log(" refuse fail");
      }
    }); 

  },


  //-----------------------------------------------------------------------------
  //删除活动
  deleteEvent:function () {
    wx.showModal({
      title: '是否删除该活动?',
      content: '删除后将不能恢复',
      showCancel: true,
      confirmColor: "#a07c52",
      cancelColor: "#646464",
      success: function (res) {
        if (res.confirm) {
          //删除此活动后返回上一页
          var Diary = Bmob.Object.extend("Events");
          var queryEvent = new Bmob.Query(Diary);
          queryEvent.get(optionId, {
            success: function (result) {
              result.destroy({
                //删除成功
                success: function (myObject) {
                  common.dataLoading("删除成功", "success", function () {
                    wx.navigateBack({
                      delta: 1
                    })
                  });
                },
                //删除失败
                error: function (myObject, error) {
                  console.log(error);
                }
              })
            },
            error: function (object, error) {
              console.log(error);
            }
          });
        } else {

        }
      }
    })
  },
}),



//根据联系方式确定序号
function getContactIndex(name) {
  var accountIndex = 0;
  if (name == "手机号") accountIndex = 0;
  else if (name == "微信号") accountIndex = 1;
  else if (name == "QQ号") accountIndex = 2;
  return accountIndex;
}

//根据活动类型获取活动类型名称
function getTypeName(acttype) {
  var acttypeName = "";
  if (acttype == 1) acttypeName = "运动";
  else if (acttype == 2) acttypeName = "游戏";
  else if (acttype == 3) acttypeName = "交友";
  else if (acttype == 4) acttypeName = "旅行";
  else if (acttype == 5) acttypeName = "读书";
  else if (acttype == 6) acttypeName = "竞赛";
  else if (acttype == 7) acttypeName = "电影";
  else if (acttype == 8) acttypeName = "音乐";
  else if (acttype == 9) acttypeName = "其他";
  return acttypeName;
}
