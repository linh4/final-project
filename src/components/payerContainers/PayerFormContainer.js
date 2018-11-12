import React, { Component } from 'react';
import PayerForm from './PayerForm'
import _ from 'lodash'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
// import CheckBoxForm from '../components/CheckBoxForm';
// import {Checkbox, CheckboxGroup} from 'react-checkbox-group';
import {getItem} from '../../actions/itemAction'
import {fetchBill, clearBill} from '../../actions/billAction'
import { deletePayer, postItemPayer, getPayer } from '../../actions/payerAction'

class PayerFormContainer extends Component {

  state = {
    renderForm: false,
    isChecked: false,
    payerArr: [],
  }

  componentDidMount() {
    console.log("inside payer form fetching")
    let itemId = this.props.match.params.id
    this.props.getItem(itemId)
    .then(() => {
      if (this.props.selectedItem) {
        let billId = this.props.selectedItem.bill_id
        this.props.fetchBill(billId)
        .then(() => this.combinePayers())
      }
    })
  }

  combinePayers = () => {
    const payers = this.props.wholeBill.payers.reduce((a,b) => a.concat(b))
    let payerArr = this.props.payers.concat(payers)
    let uniquePayers = _.uniqBy(payerArr, 'id')
    this.props.getPayer(uniquePayers)
  }

  onAddingItem = (payer) => {
    const isChecked = payer.target.checked
    const id = payer.target.id
    this.setState({isChecked: !this.state.isChecked})
    if (isChecked) {
      console.log('checked!')
      return this.setState({payerArr: [...this.state.payerArr, id]})
    } else {
      console.log('not checked')
      const newPayers = this.state.payerArr.filter(payer => payer !== id)
      return this.setState({payerArr: newPayers })
    }
  }

  handleAddPayer = (e) => {
    document.getElementById("back").style.display = 'none'
    e.target.style.display = 'none'
    this.setState({renderForm: true})
  }

  handleDeletePayer = (e, payer) => {
    const id = e.target.parentElement.children[0].id
    const newPayers = this.state.payerArr.filter(payer => payer !== id)
    this.setState({payerArr: newPayers })
    this.props.deletePayer(payer.id)
    // .then(() => this.setState({renderForm: false}))
  }

  handleDone = () => {
    let id = this.props.selectedItem.id
    let billId = this.props.selectedItem.bill_id
    this.props.postItemPayer(id, this.state.payerArr)
    .then(() => this.props.clearBill())
    .then(() => this.props.history.push(`/bills/${billId}/assignPayers`))
  }

  renderPayerList = (payer,idx) => {
    return (<div key={idx}>
      <input type="checkbox" id={payer.id} value={payer.name || ''} onChange={this.onAddingItem} />
      {payer.name}
      <button onClick={(e) => this.handleDeletePayer(e, payer)}>X</button>
    </div>
    )
  }

  render() {
    if (!this.props.wholeBill) {
      return <div>Loading</div>
    }
    else {
      return (<div>
        {this.props.selectedItem && this.props.selectedItem.title}
        {this.props.payers.map((payer, idx) => this.renderPayerList(payer, idx))}
        <PayerForm />
        ***Names should be different****
        <br/>
        <button onClick={this.handleDone}>Done</button>
      </div>)
    }
  }
}

const mapStateToProps = (state) => {
  console.log("inside PayerFormContainer", state)
  return {
    bill: state.text.bill,
    items: state.text.items,
    payers: state.payer.payers,
    selectedItem: state.text.selectedItem,
    wholeBill: state.text.wholeBill
    };
};

export default withRouter(connect(mapStateToProps, {fetchBill, deletePayer, postItemPayer, getItem, clearBill, getPayer})(PayerFormContainer))