# yb-miniapp-yzd

视塔小程序

APPID  wxd35f5e223e61fafb

component YfwModal
调用样例
1 当存在infoBtn 时  cancelBtn confirmBtn 无效

```js
<YfwModal
    title="信息一个层级，信息一个层"
    cancelBtn="取消"
    confirmBtn="确定"
    content="此处为内容。内容单行样式"
    infoBtn="我知道了"
    icon="success"
    isOpen={true}
    cancelFn={this.cancelFn.bind(this)}
    confirmFn={this.confirmFn.bind(this)}
    infoFn={this.infoFn.bind(this)}
/>
```




订单提交页面

1. 会员优惠 在返回CustomerInfo 不为null 的情况下表明有会员 当 Discount位1时 表示 暂无优惠 
   不为1时  乘以100加上% 
2. 会员积分  当BoolPointsDeduction为1时 表示可以使用积分抵扣。(moneyFlag=>true)
   当BoolPointsDeduction为0时 或  当换算比例不够时 。 不可以用积分抵扣 (moneyFlag=>false ,rankTitle=>不能使用积分抵扣时的右侧文案)
   积分抵扣根据  PointsDeductionRate / ReturnPointsRate  =>积分/金额   来计算兑换比例

   当积分抵扣的金额大于订单的金额时，最多抵扣至 订单的总金额-0.01 既订单的总金额 最低为 0.01元
   