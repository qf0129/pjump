import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  DatePicker,
  Drawer,
  Flex,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  type TableColumnsType,
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import useApp from 'antd/es/app/useApp';
import { Apis, type ReqCreateAccessGroup, type ReqQueryAccessGroup, type ReqUpdateAccessGroup } from '@/apis/apis';
import type { AccessGroup, Host, OsUser, User } from '@/utils/type';

const PAGE_SIZE = 10;
const RELATION_PAGE_SIZE = 1000;
const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

type AccessGroupForm = {
  Name: string;
  Description?: string;
  ExpiredAt?: Dayjs | null;
  AllowedOsUsernames?: string;
};

type RelationKey = 'owner' | 'user' | 'host' | 'osUser';

type RelationConfig<T> = {
  label: string;
  rowKey: keyof T;
  selectPlaceholder: string;
  getOptionLabel: (item: T) => string;
  queryRelated: (groupUid: string) => Promise<T[]>;
  queryOptions: () => Promise<T[]>;
  add: (groupUid: string, uid: string) => Promise<boolean>;
  remove: (groupUid: string, uid: string) => Promise<boolean>;
  columns: TableColumnsType<T>;
};

export default function AccessGroupPage() {
  const app = useApp();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<AccessGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AccessGroup | null>(null);
  const [drawerGroup, setDrawerGroup] = useState<AccessGroup | null>(null);
  const [form] = Form.useForm<AccessGroupForm>();

  const fetchGroups = useCallback(
    (p?: number, ps?: number, s?: string) => {
      setLoading(true);
      const params: ReqQueryAccessGroup = {
        Page: p ?? page,
        PageSize: ps ?? pageSize,
        Search: (s ?? search) || undefined,
      };
      Apis.QueryAccessGroup(params)
        .then((res) => {
          if (res.Code === 0) {
            setGroups(res.Data.List ?? []);
            setTotal(res.Data.Total ?? 0);
          } else {
            app.message.warning(res.Msg);
          }
        })
        .finally(() => setLoading(false));
    },
    [app.message, page, pageSize, search]
  );

  useEffect(() => {
    fetchGroups(1, PAGE_SIZE);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreateModal = () => {
    setEditingGroup(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (group: AccessGroup) => {
    setEditingGroup(group);
    form.setFieldsValue({
      Name: group.Name,
      Description: group.Description,
      ExpiredAt: group.ExpiredAt ? dayjs(group.ExpiredAt) : null,
      AllowedOsUsernames: (group.AllowedOsUsernames ?? []).join(','),
    });
    setModalOpen(true);
  };

  const parseAllowedNames = (value?: string) =>
    (value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const allowedNames = parseAllowedNames(values.AllowedOsUsernames);
      if (editingGroup) {
        const data: ReqUpdateAccessGroup = {
          Uid: editingGroup.Uid,
          Name: values.Name,
          Description: values.Description || '',
          ExpiredAt: values.ExpiredAt ? values.ExpiredAt.format(DATE_TIME_FORMAT) : '',
          AllowedOsUsernames: allowedNames,
        };
        Apis.UpdateAccessGroup(data).then((res) => {
          if (res.Code === 0) {
            app.message.success('更新成功');
            setModalOpen(false);
            fetchGroups();
          } else {
            app.message.warning(res.Msg);
          }
        });
      } else {
        const data: ReqCreateAccessGroup = {
          Name: values.Name,
          Description: values.Description || '',
          ExpiredAt: values.ExpiredAt ? values.ExpiredAt.format(DATE_TIME_FORMAT) : '',
          AllowedOsUsernames: allowedNames,
        };
        Apis.CreateAccessGroup(data).then((res) => {
          if (res.Code === 0) {
            app.message.success('创建成功');
            setModalOpen(false);
            setPage(1);
            fetchGroups(1, pageSize);
          } else {
            app.message.warning(res.Msg);
          }
        });
      }
    });
  };

  const handleDelete = (uid: string) => {
    Apis.DeleteAccessGroup({ Uid: uid }).then((res) => {
      if (res.Code === 0) {
        app.message.success('删除成功');
        fetchGroups();
      } else {
        app.message.warning(res.Msg);
      }
    });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    fetchGroups(1, pageSize, value);
  };

  const columns: TableColumnsType<AccessGroup> = [
    { title: '名称', dataIndex: 'Name', width: 180 },
    { title: '描述', dataIndex: 'Description', ellipsis: true },
    {
      title: '允许登录用户',
      dataIndex: 'AllowedOsUsernames',
      width: 220,
      render: (names: string[] = []) =>
        names.length ? names.map((name) => <Tag key={name}>{name}</Tag>) : <span style={{ color: '#999' }}>不限制</span>,
    },
    { title: '过期时间', dataIndex: 'ExpiredAt', width: 180, render: (value?: string) => value || '-' },
    {
      title: '操作',
      width: 260,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<SettingOutlined />} onClick={() => setDrawerGroup(record)}>
            关联数据
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该访问组？" onConfirm={() => handleDelete(record.Uid)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, height: '100%', overflow: 'auto' }}>
      <Flex align="center" justify="space-between" gap={12} style={{ marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          创建访问组
        </Button>
        <Input.Search
          placeholder="搜索名称、描述"
          allowClear
          value={search}
          onSearch={handleSearch}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </Flex>

      <Table
        rowKey="Uid"
        columns={columns}
        dataSource={groups}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
            fetchGroups(p, ps);
          },
        }}
      />

      <Modal
        title={editingGroup ? '编辑访问组' : '创建访问组'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        destroyOnHidden
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="Name" label="名称" rules={[{ required: true, message: '请输入访问组名称' }]}>
            <Input placeholder="如：研发环境访问组" />
          </Form.Item>
          <Form.Item name="Description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="AllowedOsUsernames" label="允许登录用户">
            <Input placeholder="root,dev，不填表示不限制" />
          </Form.Item>
          <Form.Item name="ExpiredAt" label="过期时间">
            <DatePicker showTime format={DATE_TIME_FORMAT} placeholder="不填表示不过期" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={drawerGroup ? `关联数据：${drawerGroup.Name}` : '关联数据'}
        open={!!drawerGroup}
        onClose={() => setDrawerGroup(null)}
        width={780}
        destroyOnHidden
      >
        {drawerGroup && <AccessGroupRelationPanel group={drawerGroup} />}
      </Drawer>
    </div>
  );
}

function AccessGroupRelationPanel({ group }: { group: AccessGroup }) {
  const app = useApp();

  const userColumns: TableColumnsType<User> = [
    { title: '用户名', dataIndex: 'Username' },
    { title: '昵称', dataIndex: 'Nickname' },
    { title: '邮箱', dataIndex: 'Email' },
  ];
  const hostColumns: TableColumnsType<Host> = [
    { title: '名称', dataIndex: 'Name' },
    { title: '地址', dataIndex: 'Ip' },
    { title: '系统', dataIndex: 'OsType', width: 100 },
  ];
  const osUserColumns: TableColumnsType<OsUser> = [
    { title: '名称', dataIndex: 'Name' },
    { title: '登录用户', dataIndex: 'Username' },
  ];

  const configs = useMemo<Record<RelationKey, RelationConfig<any>>>(
    () => ({
      owner: {
        label: '负责人',
        rowKey: 'Uid',
        selectPlaceholder: '选择负责人',
        getOptionLabel: (item: User) => `${item.Username}${item.Nickname ? ` (${item.Nickname})` : ''}`,
        queryRelated: (groupUid) => Apis.QueryAccessGroupOwner({ GroupUid: groupUid, PageSize: RELATION_PAGE_SIZE }).then(toList),
        queryOptions: () => Apis.QueryUser({ PageSize: RELATION_PAGE_SIZE }).then(toList),
        add: (groupUid, uid) => Apis.CreateAccessGroupOwner({ GroupUid: groupUid, UserUid: uid }).then(isOk),
        remove: (groupUid, uid) => Apis.DeleteAccessGroupOwner({ GroupUid: groupUid, UserUid: uid }).then(isOk),
        columns: userColumns,
      },
      user: {
        label: '成员用户',
        rowKey: 'Uid',
        selectPlaceholder: '选择成员用户',
        getOptionLabel: (item: User) => `${item.Username}${item.Nickname ? ` (${item.Nickname})` : ''}`,
        queryRelated: (groupUid) => Apis.QueryAccessGroupUser({ GroupUid: groupUid, PageSize: RELATION_PAGE_SIZE }).then(toList),
        queryOptions: () => Apis.QueryUser({ PageSize: RELATION_PAGE_SIZE }).then(toList),
        add: (groupUid, uid) => Apis.CreateAccessGroupUser({ GroupUid: groupUid, UserUid: uid }).then(isOk),
        remove: (groupUid, uid) => Apis.DeleteAccessGroupUser({ GroupUid: groupUid, UserUid: uid }).then(isOk),
        columns: userColumns,
      },
      host: {
        label: '服务器',
        rowKey: 'Uid',
        selectPlaceholder: '选择服务器',
        getOptionLabel: (item: Host) => `${item.Name || item.Ip} (${item.Ip})`,
        queryRelated: (groupUid) => Apis.QueryAccessGroupHost({ GroupUid: groupUid, PageSize: RELATION_PAGE_SIZE }).then(toList),
        queryOptions: () => Apis.QueryHost({ PageSize: RELATION_PAGE_SIZE }).then(toList),
        add: (groupUid, uid) => Apis.CreateAccessGroupHost({ GroupUid: groupUid, HostUid: uid }).then(isOk),
        remove: (groupUid, uid) => Apis.DeleteAccessGroupHost({ GroupUid: groupUid, HostUid: uid }).then(isOk),
        columns: hostColumns,
      },
      osUser: {
        label: '系统用户',
        rowKey: 'Uid',
        selectPlaceholder: '选择系统用户',
        getOptionLabel: (item: OsUser) => `${item.Name || item.Username} (${item.Username})`,
        queryRelated: (groupUid) => Apis.QueryAccessGroupOsUser({ GroupUid: groupUid, PageSize: RELATION_PAGE_SIZE }).then(toList),
        queryOptions: () => Apis.QueryOsUser({ PageSize: RELATION_PAGE_SIZE }).then(toList),
        add: (groupUid, uid) => Apis.CreateAccessGroupOsUser({ GroupUid: groupUid, OsUserUid: uid }).then(isOk),
        remove: (groupUid, uid) => Apis.DeleteAccessGroupOsUser({ GroupUid: groupUid, OsUserUid: uid }).then(isOk),
        columns: osUserColumns,
      },
    }),
    []
  );

  return (
    <Tabs
      items={(Object.keys(configs) as RelationKey[]).map((key) => ({
        key,
        label: configs[key].label,
        children: <RelationTable groupUid={group.Uid} config={configs[key]} appMessage={app.message} />,
      }))}
    />
  );
}

function RelationTable<T extends { Uid: string }>({
  groupUid,
  config,
  appMessage,
}: {
  groupUid: string;
  config: RelationConfig<T>;
  appMessage: ReturnType<typeof useApp>['message'];
}) {
  const [loading, setLoading] = useState(false);
  const [related, setRelated] = useState<T[]>([]);
  const [options, setOptions] = useState<T[]>([]);
  const [selectedUid, setSelectedUid] = useState<string>();

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([config.queryRelated(groupUid), config.queryOptions()])
      .then(([relatedList, optionList]) => {
        setRelated(relatedList);
        setOptions(optionList);
      })
      .finally(() => setLoading(false));
  }, [config, groupUid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const relatedUids = new Set(related.map((item) => item.Uid));
  const selectOptions = options
    .filter((item) => !relatedUids.has(item.Uid))
    .map((item) => ({
      value: item.Uid,
      label: config.getOptionLabel(item),
    }));

  const addRelation = () => {
    if (!selectedUid) return;
    config.add(groupUid, selectedUid).then((ok) => {
      if (ok) {
        appMessage.success('添加成功');
        setSelectedUid(undefined);
        fetchData();
      } else {
        appMessage.warning('添加失败');
      }
    });
  };

  const removeRelation = (uid: string) => {
    config.remove(groupUid, uid).then((ok) => {
      if (ok) {
        appMessage.success('移除成功');
        fetchData();
      } else {
        appMessage.warning('移除失败');
      }
    });
  };

  const columns: TableColumnsType<T> = [
    ...config.columns,
    {
      title: '操作',
      width: 90,
      render: (_, record) => (
        <Popconfirm title="确定移除该关联？" onConfirm={() => removeRelation(record.Uid)}>
          <Button type="link" size="small" danger>
            移除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Flex gap={8} style={{ marginBottom: 16 }}>
        <Select
          showSearch
          allowClear
          value={selectedUid}
          placeholder={config.selectPlaceholder}
          options={selectOptions}
          onChange={setSelectedUid}
          filterOption={(input, option) => ((option?.label as string) || '').toLowerCase().includes(input.toLowerCase())}
          style={{ flex: 1 }}
        />
        <Button type="primary" icon={<PlusOutlined />} disabled={!selectedUid} onClick={addRelation}>
          添加
        </Button>
      </Flex>
      <Table rowKey="Uid" size="small" columns={columns} dataSource={related} loading={loading} pagination={false} />
    </div>
  );
}

function toList<T>(res: { Code: number; Msg: string; Data: { List?: T[] } }) {
  if (res.Code !== 0) return [];
  return res.Data.List ?? [];
}

function isOk(res: { Code: number }) {
  return res.Code === 0;
}
