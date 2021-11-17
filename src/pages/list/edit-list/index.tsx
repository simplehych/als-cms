import React, { useState } from 'react';
import type { ProColumns } from '@ant-design/pro-table';
import { EditableProTable } from '@ant-design/pro-table';
import ProForm, { ProFormRadio, ProFormField, ProFormSwitch } from '@ant-design/pro-form';
import ProCard from '@ant-design/pro-card';

import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { MenuOutlined } from '@ant-design/icons';
import { arrayMoveImmutable } from '@ant-design/pro-utils';

const DragHandle = SortableHandle(() => <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />);

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

type DataSourceType = {
  id: React.Key;
  title?: string;
  decs?: string;
  state?: string;
  codeFlag?: string;
  subset?: DataSourceType[];
};

const defaultData: DataSourceType[] = [
  {
    id: 624748504,
    title: '活动名称一',
    decs: '这个活动真好玩',
    state: 'online',
    codeFlag: 'one',
    subset: [
      {
        id: 624748504,
        title: '活动名称一/1',
        decs: '这个活动真好玩',
        state: 'online',
        codeFlag: 'one-1',
      },
      {
        id: 624691229,
        title: '活动名称一/2',
        decs: '这个活动真好玩',
        state: 'offline',
        codeFlag: 'one-2',
      },
    ]
  },
  {
    id: 624691229,
    title: '活动名称二',
    decs: '这个活动真好玩',
    state: 'offline',
    codeFlag: 'two',
  },
];

export default () => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<DataSourceType[]>([]);
  const [position, setPosition] = useState<'top' | 'bottom' | 'hidden'>('bottom');
  const [forbiddenDrag, setForbiddenDrag] = useState(false);

  const SortableItem = SortableElement((props: any) => <tr {...props} />);
  const SortContainer = SortableContainer((props: any) => <tbody {...props} />);

  const onSortEnd = ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable([...dataSource], oldIndex, newIndex).filter((el) => !!el);
      setDataSource([...newData]);
      console.log("newData: ", JSON.stringify(newData));
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
    const index = dataSource.findIndex((x) => x.id === restProps['data-row-key']);
    return <SortableItem index={index} disabled={forbiddenDrag} {...restProps} />;
  };

  const columns: ProColumns<DataSourceType>[] = [
    {
      title: '排序',
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
      width: '20%',
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
      title: '代码标识',
      dataIndex: 'codeFlag',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules: [{ required: true, message: '此项为必填项，且须唯一' }],
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
      width: '10%',
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
            setDataSource(dataSource.filter((item) => item.id !== record.id));
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
    <>
      <EditableProTable<DataSourceType>
        rowKey="id"
        headerTitle="可编辑表格"
        maxLength={5}
        recordCreatorProps={
          position !== 'hidden'
            ? {
              position: position as 'top',
              record: () => ({
                id: Date.now(),
              }),
            }
            : false
        }
        toolBarRender={() => []}
        columns={columns}
        request={async () => ({
          data: defaultData,
          total: 3,
          success: true,
        })}
        value={dataSource}
        onChange={(values) => {
          setDataSource(values)
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

      <div style={{ height: 20 }} />

      <ProCard
        title="配置"
        headerBordered
        collapsible
        defaultCollapsed
      >
        <ProForm.Group
          title="表格配置"
          size={0}
          direction="horizontal"
          labelLayout="twoLine"
        >
          <ProFormRadio.Group
            label="添加一行数据"
            key="render"
            fieldProps={{
              value: position,
              onChange: (e) => setPosition(e.target.value),
            }}
            options={[
              { label: '顶部', value: 'top' },
              { label: '底部', value: 'bottom' },
              { label: '隐藏', value: 'hidden' },
            ]}
          />
          <ProFormSwitch
            fieldProps={{
              size: 'default',
              onChange: (checked) => console.log(checked)
            }}
            label="开关"
            tooltip="开关"
            name="switch"
          />
        </ProForm.Group>
      </ProCard>

      <ProCard title="数据JSON" headerBordered collapsible defaultCollapsed>
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
    </>
  );
};