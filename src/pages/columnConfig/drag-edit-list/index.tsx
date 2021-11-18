import React, { useEffect, useState } from 'react';
import type { ProColumns } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import ProForm, { ProFormRadio, ProFormField, ProFormSwitch } from '@ant-design/pro-form';
import ProCard from '@ant-design/pro-card';

import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { MenuOutlined } from '@ant-design/icons';
import { arrayMoveImmutable } from '@ant-design/pro-utils';
import { Cascader, Input, Select, Space, Switch } from 'antd';

const DragHandle = SortableHandle(() => <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />);

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export type ColumnType = {
  id: React.Key;
  index?: number;
  title?: string;
  decs?: string;
  state?: string;
  kind?: string;
  kindParams?: string;
  subset?: ColumnType[];
  subColumn?: ColumnType[];
  extendInfo?: string,
};

const DragEditList = (topProps) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<ColumnType[]>([]);
  const [positionOfAddData, setPositionOfAddData] = useState<'top' | 'bottom' | 'hidden'>('bottom');
  const [forbiddenDrag, setForbiddenDrag] = useState(false);
  const [devInfoSwitch, setDevInfoSwitch] = useState(false);
  const [headerTitle, setHeaderTitle] = useState('');

  const SortableItem = SortableElement((props: any) => <tr {...props} />);
  const SortContainer = SortableContainer((props: any) => <tbody {...props} />);

  useEffect(() => {
    console.log("DragEditList useEffect topProps: ", JSON.stringify(topProps))
    if (topProps.data) setDataSource(topProps.data)
    if (topProps.title) setHeaderTitle(topProps.title)
    return () => { }
  }, [topProps])

  const updateData = (newData: ColumnType[]) => {
    setDataSource(newData);
    topProps.callback(newData)
  }

  const onSortEnd = ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable([...dataSource], oldIndex, newIndex).filter((el) => !!el);
      updateData([...newData])
    }
  };

  const DraggableContainer = (props: any) => (
    <SortContainer
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      {...props}
    />
  );

  const DraggableBodyRow = (props: any) => {
    const { className, style, ...restProps } = props;
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = dataSource?.findIndex((x) => x.id === restProps['data-row-key']);
    return <SortableItem index={index} disabled={forbiddenDrag} {...restProps} />;
  };

  const columns: ProColumns<ColumnType>[] = [
    {
      title: '排序',
      dataIndex: 'sort',
      width: 60,
      className: 'drag-visible',
      editable: false,
      render: () => <DragHandle />,
    },
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 60,
    },
    {
      title: '名称',
      dataIndex: 'title',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules: [{ required: true, message: '此项为必填项' }],
        };
      },
      // width: '20%',
    },
    {
      title: '描述',
      dataIndex: 'decs',
      fieldProps: (from, { rowKey, rowIndex }) => {
        if (from.getFieldValue([rowKey || '', 'title']) === '不好玩') {
          return {
            disabled: true,
          };
        }
        return {};
      },
    },
    {
      title: '类型',
      dataIndex: 'kind',
      valueType: 'select',
      valueEnum: {
        column: { text: '栏目', },
        article: { text: '文章', },
        link: { text: '链接', },
      },
      formItemProps: (form, { rowKey, rowIndex }) => {
        return {
          rules: [{ required: true, message: '此项为必填项' }],
          initialValue: 'column',
        };
      },
      fieldProps: (form, { rowKey, rowIndex }) => {
        return {}
      },
    },
    {
      title: '类型参数',
      dataIndex: 'kindParams',
      fieldProps: (form, { rowKey, rowIndex }) => {
        return { placeholder: '请输入', }
      },
      formItemProps: (form, { rowKey, rowIndex }) => {
        const kind = form.getFieldValue([rowKey || '', 'kind'])
        let messageTip = '请输入'
        switch (kind) {
          case 'column': messageTip = '请输入栏目标识'; break;
          case 'article': messageTip = '请输入文章id'; break;
          case 'link': messageTip = '请输入链接地址'; break;
          default: break;
        }
        return {
          rules: [{ required: true, message: messageTip }],
        };
      },
    },
    {
      title: '状态',
      key: 'state',
      filters: true,
      onFilter: true,
      dataIndex: 'state',
      valueType: 'select',
      valueEnum: {
        online: {
          text: '上线',
          status: 'Success',
        },
        offline: {
          text: '下线',
          status: 'Error',
        },
      },
      formItemProps: (form, { rowKey, rowIndex }) => {
        return {
          initialValue: 'online',
        };
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            const newData = dataSource.filter((item) => item.id !== record.id)
            updateData(newData)
          }}
        >
          删除
        </a>,
        record.subset ? (<a onClick={() => {
        }}>展开</a>) : <a ></a>
        ,
      ],
    },
  ];

  return (
    <div {...topProps}>
      <EditableProTable<ColumnType>
        rowKey="id"
        headerTitle={headerTitle}
        // maxLength={5}
        recordCreatorProps={
          positionOfAddData !== 'hidden' && devInfoSwitch
            ? {
              position: positionOfAddData as 'top',
              record: () => ({
                id: Date.now(),
              }),
            }
            : false
        }
        toolBarRender={() => [
          <Switch checkedChildren="开发信息" unCheckedChildren="开发信息"
            defaultChecked={devInfoSwitch} onChange={setDevInfoSwitch} />,
        ]}
        columns={columns}
        value={dataSource}
        onChange={(values) => {
          updateData(values)
        }}
        editable={{
          type: 'multiple',
          editableKeys,
          onSave: async (rowKey, data, row) => {
            console.log("onSave", rowKey, data, row);
            // await waitTime(2000);
            setForbiddenDrag(false)
          },
          onChange: (values) => {
            console.log('onChange ', values);
            setEditableRowKeys(values);
            setForbiddenDrag(values.length > 0)
          },
          onDelete: async () => {
            console.log('onDelete');
          },
          onCancel: async () => {
            console.log('onCancel');
          },
        }}
        components={{
          body: {
            wrapper: DraggableContainer,
            row: DraggableBodyRow,
          },
        }}
      />

      {
        devInfoSwitch
          ? <div style={{ padding: 20, }}>
            <ProCard title="配置" headerBordered bordered collapsible defaultCollapsed>
              <ProForm.Group
                size={0}
                direction="horizontal"
                labelLayout="twoLine"
              >
                <ProFormRadio.Group
                  label="添加一行数据"
                  key="render"
                  fieldProps={{
                    value: positionOfAddData,
                    onChange: (e) => setPositionOfAddData(e.target.value),
                  }}
                  options={[
                    { label: '顶部', value: 'top' },
                    { label: '底部', value: 'bottom' },
                    { label: '隐藏', value: 'hidden' },
                  ]}
                />
              </ProForm.Group>
            </ProCard>

            <ProCard title="数据JSON" headerBordered bordered collapsible defaultCollapsed>
              <ProFormField
                ignoreFormItem
                fieldProps={{
                  style: {
                    width: '100%',
                  },
                }}
                mode="read"
                valueType="jsonCode"
                text={JSON.stringify(dataSource)}
              />
            </ProCard>
          </div>
          : ""
      }
    </div>
  );
};

export default DragEditList