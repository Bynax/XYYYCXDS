//获取应用实例
var app = getApp()
var Bmob = require("../../utils/bmob.js");
var common = require('../template/getCode.js')
var that;
var optionId;
var publisherId;
var contactId;
var myDate = new Date();
//格式化日期
function formate_data(myDate) {
  let month_add = myDate.getMonth() + 1;
  var formate_result = myDate.getFullYear() + '-' +
    month_add + '-' +
    myDate.getDate()
  return formate_result;
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    notice_status: false,
    accounts: ["手机号", "微信号", "QQ号"],
    accountIndex: 0,
    peopleHide: false,
    isAgree: false,
    date: formate_data(myDate),
    address: '点击选择位置',
    longitude: 0, //经度
    latitude: 0, //纬度
    showTopTips: false,
    TopTips: '',
    noteMaxLen: 200, //备注最多字数
    content: "",
    noteNowLen: 0, //备注当前字数
    types: ["党支部", "学苑", "团委", "研会", "社团"],
    typeIndex: "0",
    showInput: false, //显示输入真实姓名,
  },

  tapNotice: function (e) {
    if (e.target.id == 'notice') {
      this.hideNotice();
    }
  },
  showNotice: function (e) {
    this.setData({
      'notice_status': true
    });
  },
  hideNotice: function (e) {
    this.setData({
      'notice_status': false
    });
  },


  //字数改变触发事件
  bindTextAreaChange: function (e) {
    var that = this
    var value = e.detail.value,
      len = parseInt(value.length);
    if (len > that.data.noteMaxLen)
      return;
    that.setData({
      content: value,
      noteNowLen: len
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    optionId = options.actid;
    publisherId = options.pubid;
    that.setData({ //初始化数据
      src: "",
      isSrc: false,
      ishide: "0",
      autoFocus: true,
      isLoading: false,
      loading: true,
      isdisabled: false
    })
    var Diary = Bmob.Object.extend("Events");
    var query = new Bmob.Query(Diary);
    query.equalTo("objectId", optionId);
    query.include("contact");
    query.find({
      success: function (result) {
        var title = result[0].get("title");
        var content = result[0].get("discription");
        var contact = result[0].get("contact");
        var acttype = result[0].get("acttype");
        var endtime = result[0].get("endtime");
        var address = result[0].get("address");
        var peoplenum = result[0].get("num_limit");
        var realname = contact.realname;
        var accountIndex = getContactIndex(contact.contactWay);
        var contactValue = contact.contactValue;
        if (peoplenum > 0) {
          that.setData({
            switchp: true,
            peopleHide: true
          })
        }
        that.setData({
          title: title,
          typeIndex: acttype - 1,
          address: address,
          date: endtime,
          peoplenum: peoplenum,
          content: content,
          realname: realname,
          accountIndex: accountIndex,
          contactValue: contactValue
        })
      },
      error: function (error) {
        console.log(error);
      }
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
    var myInterval = setInterval(getReturn, 500); ////半秒定时查询
    function getReturn() {
      wx.getStorage({
        key: 'user_openid',
        success: function (ress) {
          if (ress.data) {
            clearInterval(myInterval)
            that.setData({
              loading: true
            })
          }
        }
      })
    }
  },
  //限制人数
  switch1Change: function (e) {
    if (e.detail.value == false) {
      this.setData({
        peopleHide: false
      })
    } else if (e.detail.value == true) {
      this.setData({
        peopleHide: true
      })
    }
  },

  //改变时间
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },

  //改变活动类别
  bindTypeChange: function (e) {
    this.setData({
      typeIndex: e.detail.value
    })
  },
  //选择地点
  addressChange: function (e) {
    this.addressChoose(e);
  },
  addressChoose: function (e) {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          address: res.name,
          longitude: res.longitude, //经度
          latitude: res.latitude, //纬度
          upadnew: true, //更新了地址
        })
        if (e.detail && e.detail.value) {
          this.data.address = e.detail.value;
        }
      },
      fail: function (e) { },
      complete: function (e) { }
    })
  },

  //改变联系方式
  bindAccountChange: function (e) {
    this.setData({
      accountIndex: e.detail.value
    })
  },


  //表单验证
  showTopTips: function () {
    var that = this;
    this.setData({
      showTopTips: true
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 3000);
  },
  //提交表单
  submitForm: function (e) {
    var wxReg = new RegExp("^[a-zA-Z]{1}[-_a-zA-Z0-9]{5,19}$");
    var qqReg = new RegExp("[1-9][0-9]{4,}");
    var phReg = new RegExp("0?(13|14|15|17|18|19)[0-9]{9}");
    var nameReg = new RegExp("^[\u4e00-\u9fa5]{2,4}$");

    var that = this;
    var title = e.detail.value.title;
    var endtime = this.data.date;
    var typeIndex = this.data.typeIndex;
    var acttype = 1 + parseInt(typeIndex);
    var acttypename = getTypeName(acttype); //获得类型名称
    var address = this.data.address;
    var longitude = this.data.longitude; //经度
    var latitude = this.data.latitude; //纬度
    var switchHide = e.detail.value.switchHide;
    var peoplenum = e.detail.value.peoplenum;
    var content = e.detail.value.content;
    //------发布者真实信息------
    var realname = e.detail.value.realname;
    var contactindex = this.data.accountIndex;

    if (contactindex == 0) {
      var contactWay = "手机号";
    } else if (contactindex == 1) {
      var contactWay = "微信号";
    } else if (contactindex == 2) {
      var contactWay = "QQ号";
    }
    var contactValue = e.detail.value.contactValue;

    //先进行表单非空验证
    if (title == "") {
      this.setData({
        showTopTips: true,
        TopTips: '请输入主题'
      });
    } else if (address == '点击选择位置') {
      this.setData({
        showTopTips: true,
        TopTips: '请选择地点'
      });
    } else if (switchHide == true && peoplenum == undefined) {
      this.setData({
        showTopTips: true,
        TopTips: '请输入人数'
      });
    } else if (content == "") {
      this.setData({
        showTopTips: true,
        TopTips: '请输入活动内容'
      });
    } else if (realname == "") {
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
      that.setData({
        isLoading: true,
        isdisabled: true
      })

      //修改Events 表中的数据
      wx.getStorage({
        key: 'user_id',
        success: function (ress) {
          var Diary = Bmob.Object.extend("Events");
          var query = new Bmob.Query(Diary);
          query.get(optionId, {
            success: function (result) {
              result.set("title", title);
              result.set("endtime", endtime);
              result.set("acttype", acttype);
              if (that.data.upadnew) { //如果改变了地点
                result.set("address", address);
                result.set("longitude", longitude); //经度
                result.set("latitude", latitude); //纬度
              }
              if (that.data.peopleHide) { //如果设置了人数
                console.log(peoplenum);
                result.set("num_limit", peoplenum);
              } else if (!that.data.peopleHide) {
                result.set("num_limit", -1);
              }
              result.set("discription", content);
              //修改操作
              result.save(null, {
                success: function (result) {
                  //再将发布者的信息更新到联系表中
                  var Contacts = Bmob.Object.extend("Contacts");
                  var contact = new Bmob.Query("Contacts");
                  contact.get(contactId, {
                    success: function (result) {
                      result.set("realname", realname);
                      result.set("contactWay", contactWay);
                      result.set("contactValue", contactValue);
                      result.save();
                    },
                  });
                  that.setData({
                    isLoading: false,
                    isdisabled: false,
                    eventId: result.id,
                  })
                  //添加成功，返回成功之后的objectId(注意，返回的属性名字是id,而不是objectId)
                  common.dataLoading("修改成功", "success", function () {
                    
                  });
                },
                error: function (result, error) {
                  //添加失败
                  console.log("修改失败=" + error);
                  common.dataLoading("修改失败，请稍后重试", "fail", function () {
                  });
                  that.setData({
                    isLoading: false,
                    isdisabled: false
                  })
                }
              })
            }
          })
        },
      })
    }
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 1000);
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

  },


})
//根据活动类型获取活动类型名称
function getTypeName(acttype) {
  var acttypeName = "";
  if (acttype == 1) acttypeName = "党支部";
  else if (acttype == 2) acttypeName = "学苑";
  else if (acttype == 3) acttypeName = "团委";
  else if (acttype == 4) acttypeName = "研会";
  else if (acttype == 5) acttypeName = "社团";
  return acttypeName;
}
//根据联系方式确定序号
function getContactIndex(name) {
  var accountIndex = 0;
  if (name == "手机号") accountIndex = 0;
  else if (name == "微信号") accountIndex = 1;
  else if (name == "QQ号") accountIndex = 2;
  return accountIndex;
}