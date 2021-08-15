import { CHANGESTATE } from '../constants/index'

export const changeState = (data) => {
  return {
    data,
    type: CHANGESTATE
  }
}