/* eslint-disable @typescript-eslint/no-use-before-define */
import ProCard from '@ant-design/pro-card';
import TabPane from '@ant-design/pro-card/lib/components/TabPane';
import { PageContainer } from '@ant-design/pro-layout';
import { Space, Tabs } from 'antd';
import { FC, useEffect, useState } from 'react';
import { fetchColumn } from '../Article/wx_cloud_func';
import { ColumnType } from '../columnConfig/drag-edit-list';
import Articles from './articles';

const defaultData: ColumnType[] = [
  {
    id: 624748504,
    title: '护理',
    decs: '这个活动真好玩',
    state: 'online',
    subColumn: [],
  },
]

const Search: FC = (props) => {
  const [dataList, setDataList] = useState<ColumnType[]>(defaultData)
  const [tabIndexOfTop, setTabIndexOfTop] = useState('0')
  const [tabIndexOfSecondary, setTabIndexOfSecondary] = useState('0')
  const map = new Map()


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
          setTabIndexOfTop('0')
        }
      })
      .catch((err) => { console.log(`getData catch: ${JSON.stringify(err)}`) })
  }

  return (
    <PageContainer
      fixedHeader
      header={{
        title: '页面标题',
        breadcrumb: {
          routes: [],
        },
      }}
      // extra={<div >extra</div>}
      // extraContent={[<div >extraContent</div>]}
      // footer={[<div >footer</div>]}
      content={
        <div>
          <Tabs size='large' defaultActiveKey={'0'} type='card' tabBarGutter={16}
            activeKey={tabIndexOfTop}
            centered
            onChange={(activeKey) => {
              setTabIndexOfTop(activeKey)
              setTabIndexOfSecondary(map.get(activeKey))
            }}
          >
            {
              dataList.map((topValue, topIndex) => {
                map.set(topIndex, 0)
                const subsetData = dataList[topIndex].subset
                return (
                  <TabPane tab={topValue.title} key={`${topIndex}`}
                    cardProps={{ bodyStyle: { padding: 0 } }}>
                    <Tabs defaultActiveKey={`${map.get(topIndex)}`} type='line'
                    centered
                      activeKey={tabIndexOfSecondary}
                      animated={false}
                      onChange={(activeKey) => {
                        map.set(topIndex, activeKey)
                        setTabIndexOfSecondary(activeKey)
                      }}
                    >
                      {
                        subsetData?.map((secondaryValue, secondaryIndex) => (
                          <TabPane tab={secondaryValue.title} key={`${secondaryIndex}`} style={{ height: 0 }} />
                        ))
                      }
                    </Tabs>
                  </TabPane>
                )
              })
            }
          </Tabs>
        </div>
      }
    // tabList={[
    //   {
    //     tab: '已选择',
    //     key: '1',
    //   },
    //   {
    //     tab: '可点击',
    //     key: '2',
    //   },
    //   {
    //     tab: '禁用',
    //     key: '3',
    //     disabled: true,
    //   },
    // ]}
    >
      <Articles />
    </PageContainer>

    // <div>
    //   <ProCard

    //     tabs={{
    //       type: 'line',
    //       tabPosition: 'top',
    //       centered: true,
    //       size: 'large',
    //       activeKey: curTabKey,
    //       onChange: (key) => {
    //         setCurTabKey(key);
    //       },
    //     }}
    //   >
    //     {dataList.map((value: ColumnType, index) => (
    //       <ProCard.TabPane key={`${value.id}`} tab={value.title} >
    //         <Articles data={value.subset} />
    //       </ProCard.TabPane>
    //     ))}
    //   </ProCard>
    // </div>
  );
};

export default Search;
