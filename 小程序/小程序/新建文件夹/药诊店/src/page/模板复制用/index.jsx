import { Component } from 'react'
import { View, Image } from '@tarojs/components'

import './index.less'

export default class Index extends Component {
  constructor() {
    super();
    this.state = {

    };
  }
  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  render () {
    return (
      <View className='index'>
        <Text>Hello world!</Text>
      </View>
    )
  }
}
