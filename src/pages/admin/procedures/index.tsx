
import { useAuth } from '@/context/auth';
import { procedureService } from '@/services/secretary/procedure';
import { ProcedureState, type PaginatedResponse } from '@/types/procedure';
import type { SecretaryProcedure } from '@/types/secretary';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { Button, Card, Input, Select, Space, Table, Tag, Typography } from 'antd';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

const { Title } = Typography;
const { Option } = Select;

const statusColors = {
  [ProcedureState.PENDING]: 'orange',
  [ProcedureState.IN_PROGRESS]: 'blue',
  [ProcedureState.APPROVED]: 'green',
  [ProcedureState.REJECTED]: 'red',
  [ProcedureState.COMPLETED]: 'purple',
};

const ProceduresPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    page: 1,
    pageSize: 10,
  });

  const queryOptions: UseQueryOptions<PaginatedResponse<SecretaryProcedure>> = {
    queryKey: ['procedures', filters],
    queryFn: () =>
      procedureService.getProcedures(
        {
          search: filters.search,
          status: filters.status,
          type: filters.type,
        },
        filters.page,
        filters.pageSize
      ),
  };

  const { data, isLoading, refetch } = useQuery<PaginatedResponse<SecretaryProcedure>>(queryOptions);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value, page: 1 }));
  };

  const handleTypeChange = (value: string) => {
    setFilters(prev => ({ ...prev, type: value, page: 1 }));
  };

  const handleTableChange = (pagination: any) => {
    setFilters(prev => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Solicitante',
      key: 'solicitante',
      render: (record: SecretaryProcedure) => (
        <div>
          <div>{`${record.nombre} ${record.apellidos}`}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.ci}</div>
        </div>
      ),
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_estudio',
      key: 'tipo_estudio',
      render: (tipo: string) => (
        <Tag color={tipo === 'PREGRADO' ? 'blue' : 'purple'}>
          {tipo === 'PREGRADO' ? 'Pregrado' : 'Posgrado'}
        </Tag>
      ),
    },
    {
      title: 'Carrera',
      dataIndex: 'carrera',
      key: 'carrera',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => (
        <Tag color={statusColors[estado as keyof typeof statusColors] || 'default'}>
          {estado}
        </Tag>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (fecha: string) =>
        fecha ? format(new Date(fecha), 'PPpp', { locale: es }) : 'N/A',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (record: SecretaryProcedure) => (
        <Space size="middle">
          <Button size="small">Ver</Button>
          <Button size="small" type="primary">
            Gestionar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Gestión de Trámites</Title>
        <Button type="primary">
          Nuevo Trámite
        </Button>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Buscar por nombre o CI..."
              prefix={<SearchOutlined />}
              onChange={e => handleSearch(e.target.value)}
              allowClear
            />
          </div>
          <div>
            <Select
              placeholder="Filtrar por estado"
              style={{ width: '100%' }}
              allowClear
              onChange={handleStatusChange}
            >
              {Object.entries(ProcedureState).map(([key, value]) => (
                <Option key={key} value={value}>
                  {value}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <Select
              placeholder="Filtrar por tipo"
              style={{ width: '100%' }}
              allowClear
              onChange={handleTypeChange}
            >
              <Option value="PREGRADO">Pregrado</Option>
              <Option value="POSGRADO">Posgrado</Option>
            </Select>
          </div>
          <div>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setFilters({
                  search: '',
                  status: '',
                  type: '',
                  page: 1,
                  pageSize: 10,
                });
              }}
              style={{ width: '100%' }}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={data?.results || []}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: data?.count || 0,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Total ${total} trámites`,
          }}
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default ProceduresPage;
