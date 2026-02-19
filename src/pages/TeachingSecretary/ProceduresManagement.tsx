import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

interface ProcedureType {
  key: string;
  id: number;
  name: string;
  status: 'Pendiente' | 'En proceso' | 'Completado';
  date: string;
  student: string;
}

export function ProceduresManagement() {
  // Sample data - replace with actual data from your API
  const data: ProcedureType[] = [
    { 
      key: '1',
      id: 1, 
      name: 'Solicitud de título', 
      status: 'Pendiente', 
      date: '2025-01-20', 
      student: 'Juan Pérez' 
    },
    { 
      key: '2',
      id: 2, 
      name: 'Legalización de título', 
      status: 'En proceso', 
      date: '2025-01-19', 
      student: 'Ana García' 
    },
    { 
      key: '3',
      id: 3, 
      name: 'Certificación de notas', 
      status: 'Completado', 
      date: '2025-01-18', 
      student: 'Carlos López' 
    },
  ];

  const columns: ColumnsType<ProcedureType> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Nombre del Trámite',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Estudiante',
      dataIndex: 'student',
      key: 'student',
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      width: 120,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProcedureType['status']) => {
        let color = status === 'Completado' ? 'success' : status === 'En proceso' ? 'processing' : 'error';
        return (
          <Tag color={color} key={status}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button type="link" size="small">
            Ver
          </Button>
          <Button type="link" size="small">
            Editar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          Gestión de Trámites
        </Title>
        <Button type="primary" icon={<PlusOutlined />}>
          Nuevo Trámite
        </Button>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <Title level={5} style={{ marginBottom: '16px' }}>
          Filtros
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            {/* Add filter components here */}
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 5, showSizeChanger: true, pageSizeOptions: ['5', '10', '25'] }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
}
