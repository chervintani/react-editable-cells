import React, { useContext, useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import './index.css';
import moment from 'moment';
import {
  Table,
  Input,
  Button,
  Popconfirm,
  Form,
  DatePicker,
  TimePicker
} from 'antd';
const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const [dateTimeString, setDateTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [timeString, setTimeString] = useState('');
  const inputRef = useRef(null);
  const inputRef2 = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      setDateString(children[1].toString().substring(0, 8));
      // setTimeString(children[1].toString().substring(9,children[1].toString().length))
      setTimeString(children[1].toString());
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: moment(record[dataIndex])
    });
  };

  const save = async time => {
    try {
      const values = await form.validateFields();
      values.name = dateTimeString;
      // console.log('dateTimeString',`${dateTimeString} ${time}`)
      let name = `${dateString} ${time}`;
      toggleEdit();
      handleSave({ ...record, name: name });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  const onDoneDate = e => {
    console.log(moment(e).format('MM/DD/YY'));
    // console.log(children[1].toString().substring(0,8))
    setDateString(moment(e).format('MM/DD/YY'));
    inputRef2.current.focus();
    return setDateTimeString(moment(e).format('MM/DD/YY'));
  };

  const onDoneTime = async e => {
    console.log(moment(e).format('hh:mm A'));
    // setDateTimeString(`${dateTimeString} ${moment(e).format('hh:mm A')}`)
    save(moment(e).format('hh:mm A'));
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
          display: 'flex'
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`
          }
        ]}
      >
        {/* <Input ref={inputRef} onPressEnter={save} onBlur={save} /> */}
        <DatePicker
          ref={inputRef}
          onChange={onDoneDate}
          value={moment(dateString)}
        />
        <TimePicker
          ref={inputRef2}
          use12Hours
          format={'hh:mm A'}
          onChange={onDoneTime}
          value={moment(timeString)}
        />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: 'name',
        dataIndex: 'name',
        width: '60%',
        editable: true
      },
      {
        title: 'age',
        dataIndex: 'age'
      },
      {
        title: 'address',
        dataIndex: 'address'
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        render: (_, record) =>
          this.state.dataSource.length >= 1 ? (
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => this.handleDelete(record.key)}
            >
              <a>Delete</a>
            </Popconfirm>
          ) : null
      }
    ];
    this.state = {
      dataSource: [
        {
          key: '0',
          name: moment().format('MM/DD/YY hh:mm A'),
          age: '32',
          address: 'London, Park Lane no. 0'
        },
        {
          key: '1',
          name: 'Edward King 1',
          age: '32',
          address: 'London, Park Lane no. 1'
        }
      ],
      count: 2
    };
  }

  handleDelete = key => {
    const dataSource = [...this.state.dataSource];
    this.setState({
      dataSource: dataSource.filter(item => item.key !== key)
    });
  };
  handleAdd = () => {
    const { count, dataSource } = this.state;
    const newData = {
      key: count,
      name: `Edward King ${count}`,
      age: '32',
      address: `London, Park Lane no. ${count}`
    };
    this.setState({
      dataSource: [...dataSource, newData],
      count: count + 1
    });
  };
  handleSave = row => {
    // row.name = moment('2021-08-05T15:15:36.000Z').format('MM/DD/YYYY, h:mm:ss a');
    console.log('row.name', row);

    const newData = [...this.state.dataSource];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    this.setState({
      dataSource: newData
    });
  };

  render() {
    const { dataSource } = this.state;
    const components = {
      body: {
        row: EditableRow,
        cell: EditableCell
      }
    };
    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }

      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave
        })
      };
    });
    return (
      <div>
        <Button
          onClick={this.handleAdd}
          type="primary"
          style={{
            marginBottom: 16
          }}
        >
          Add a row
        </Button>
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={dataSource}
          columns={columns}
        />
      </div>
    );
  }
}

ReactDOM.render(<EditableTable />, document.getElementById('container'));
