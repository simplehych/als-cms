/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useState } from 'react';
import ProCard from '@ant-design/pro-card';
import DragEditList, { ColumnType } from './drag-edit-list';
import { Affix, Button, Col, Row, Switch } from 'antd';
import { fetchColumn, saveColumn } from '../Article/wx_cloud_func';

const defaultData: ColumnType[] = [
  {
    id: 624748504,
    title: '护理',
    decs: '这个活动真好玩',
    state: 'online',
    subColumn: [],
  },
]

export default () => {
  const [dataList, setDataList] = useState<ColumnType[]>(defaultData)
  const [curTabKey, setCurTabKey] = useState(`${defaultData[0].id}`)
  const [showConfigSwitch, setShowConfigSwitch] = useState(false)

  useEffect(() => {
    getData()
    return () => {
      // 销毁
    }
  }, [])

  const getData = () => {
    fetchColumn()
      .then((res) => {
        console.log(`getData then: ${JSON.stringify(res)}`)
        const dataStr = JSON.parse(res.resp_data)
        const dataOb = JSON.parse(dataStr)
        if (dataOb) {
          setDataList(dataOb)
          setCurTabKey(`${dataOb[0].id}`)
        }
      })
      .catch((err) => { console.log(`getData catch: ${JSON.stringify(err)}`) })
  }

  const saveData = () => {
    saveColumn(JSON.stringify(dataList))
      .then((res) => { console.log(`saveData then: ${JSON.stringify(res)}`) })
      .catch((err) => { console.log(`saveData catch: ${JSON.stringify(err)}`) })
  }

  return (
    <div>

      <Row justify="space-between" align='middle'>
        <Col style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 10 }}>
          栏目配置
        </Col>
        <Col>
          <Switch checkedChildren="配置" unCheckedChildren="配置"
            defaultChecked={showConfigSwitch} onChange={setShowConfigSwitch} />
        </Col>
      </Row>
      {showConfigSwitch
        ? <DragEditList title='首页配置' style={{ marginBottom: 20 }}
          data={dataList}
          callback={(values) => {
            console.log("column: ", JSON.stringify(values))
            setDataList(values)
          }} />
        : ""
      }
      <ProCard
        tabs={{
          tabPosition: 'top',
          activeKey: curTabKey,
          onChange: (key) => {
            setCurTabKey(key);
          },
        }}
      >
        {dataList.map((value: ColumnType, index) => (
          <ProCard.TabPane key={`${value.id}`} tab={value.title} >
            <DragEditList title={value.title}
              data={value.subset}
              callback={(values: ColumnType[]) => {
                console.log("column: ", JSON.stringify(values))
                dataList[index].subset = values
                const newDataList = [...dataList]
                setDataList(newDataList)
              }} />
          </ProCard.TabPane>
        ))}
      </ProCard>
      <Affix offsetBottom={10} offsetTop={10} >
        <Button type="primary" onClick={saveData} style={{ width: '100%', textAlign: 'center', marginTop: 10, }}>
          保存
        </Button>
      </Affix>
    </div>
  );
};