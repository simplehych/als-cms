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
      title: '??????',
      dataIndex: 'sort',
      width: 60,
      className: 'drag-visible',
      editable: false,
      render: () => <DragHandle />,
    },
    {
      title: '??????',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 60,
    },
    {
      title: '??????',
      dataIndex: 'title',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules: [{ required: true, message: '??????????????????' }],
        };
      },
      // width: '20%',
    },
    {
      title: '??????',
      dataIndex: 'decs',
      fieldProps: (from, { rowKey, rowIndex }) => {
        if (from.getFieldValue([rowKey || '', 'title']) === '?????????') {
          return {
            disabled: true,
          };
        }
        return {};
      },
    },
    {
      title: '??????',
      dataIndex: 'kind',
      valueType: 'select',
      valueEnum: {
        column: { text: '??????', },
        article: { text: '??????', },
        link: { text: '??????', },
      },
      formItemProps: (form, { rowKey, rowIndex }) => {
        return {
          rules: [{ required: true, message: '??????????????????' }],
          initialValue: 'column',
        };
      },
      fieldProps: (form, { rowKey, rowIndex }) => {
        return {}
      },
    },
    {
      title: '????????????',
      dataIndex: 'kindParams',
      fieldProps: (form, { rowKey, rowIndex }) => {
        return { placeholder: '?????????', }
      },
      formItemProps: (form, { rowKey, rowIndex }) => {
        const kind = form.getFieldValue([rowKey || '', 'kind'])
        let messageTip = '?????????'
        switch (kind) {
          case 'column': messageTip = '?????????????????????'; break;
          case 'article': messageTip = '???????????????id'; break;
          case 'link': messageTip = '?????????????????????'; break;
          default: break;
        }
        return {
          rules: [{ required: true, message: messageTip }],
        };
      },
    },
    {
      title: '??????',
      key: 'state',
      filters: true,
      onFilter: true,
      dataIndex: 'state',
      valueType: 'select',
      valueEnum: {
        online: {
          text: '??????',
          status: 'Success',
        },
        offline: {
          text: '??????',
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
      title: '??????',
      valueType: 'option',
      width: 200,
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          ??????
        </a>,
        <a
          key="delete"
          onClick={() => {
            const newData = dataSource.filter((item) => item.id !== record.id)
            updateData(newData)
          }}
        >
          ??????
        </a>,
        record.subset ? (<a onClick={() => {
        }}>??????</a>) : <a ></a>
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
          <Switch checkedChildren="????????????" unCheckedChildren="????????????"
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
            <ProCard title="??????" headerBordered bordered collapsible defaultCollapsed>
              <ProForm.Group
                size={0}
                direction="horizontal"
                labelLayout="twoLine"
              >
                <ProFormRadio.Group
                  label="??????????????????"
                  key="render"
                  fieldProps={{
                    value: positionOfAddData,
                    onChange: (e) => setPositionOfAddData(e.target.value),
                  }}
                  options={[
                    { label: '??????', value: 'top' },
                    { label: '??????', value: 'bottom' },
                    { label: '??????', value: 'hidden' },
                  ]}
                />
              </ProForm.Group>
            </ProCard>

            <ProCard title="??????JSON" headerBordered bordered collapsible defaultCollapsed>
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