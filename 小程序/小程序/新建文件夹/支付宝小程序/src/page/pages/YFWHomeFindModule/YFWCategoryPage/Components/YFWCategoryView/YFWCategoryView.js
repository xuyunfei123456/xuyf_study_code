import Taro, { Component } from '@tarojs/taro'
import { View,Text } from '@tarojs/components'
import './YFWCategoryView.scss'

class YFWCategoryView extends Component {

    config = {
        component: true
    }
    static defaultProps = {
        data:[],
        classData:[],
        selectIndex:0
    } 
    constructor(props) {
        super(...arguments)
        const { selectIndex } = props
        this.state ={
            _selectIndex:selectIndex,
        }
    }

    componentWillMount () { }

    componentDidMount () { }

    componentWillReceiveProps(nextProps) {
        const { _selectIndex } = this.state
        const { selectIndex } = nextProps
    
        if (_selectIndex !== selectIndex) {
          this.setState({ _selectIndex: selectIndex })
        }
    }
    pressRow (infoindex) {
        this.setState({
            _selectIndex:infoindex, 
        },()=>{
            if(this.props.onPressRow){
                this.props.onPressRow({selectIndex:infoindex})
            }
        })
    }
    render () {
        const { data } = this.props
        const { _selectIndex } = this.state

        return (
            <View className='left-list'>
                {data.map((items, infoindex) => {
                return (
                    <View className='left-context' key={items.id.toString()+'left'} onClick={this.pressRow.bind(this,infoindex)}>
                    <View
                        className={
                        'leftline-select ' +
                        (infoindex == _selectIndex ? 'leftline' : '')
                        }
                    ></View>
                    <Text
                        className={
                        'left-text ' +
                        (infoindex == _selectIndex ? 'left-text-select' : '')
                        }
                    >
                        {items.name}
                    </Text>
                    </View>
                )
                })}
                

          </View>
        )
    }
}

export default YFWCategoryView