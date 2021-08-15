import { pushNavigation } from '../../../../../apis/YFWRouting.js'



var ORDER_EVALUATION = "order_evaluation"  


class OrderClick{
  static buttonClick(item){
    switch(item.type){
      case ORDER_EVALUATION:
        this.evaluationOrder(item)
      break
    }
  }

  static evaluationOrder(item){
    pushNavigation('get_order_evaluation', { 'order_no': item.order_no, 'shop_title': item.datas.shop_title, 'img_url': item.datas.goods_items[0][0].img_url, 'order_total': item.datas.order_total })
  }
}

export { OrderClick}