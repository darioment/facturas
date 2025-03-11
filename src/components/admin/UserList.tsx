import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User } from '../../types';
import { toast } from 'react-toastify';
import { UserCog, Trash2, UserPlus } from 'lucide-react';

import Table from '../ui/Table';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Card from '../ui/Card';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data as User[]);
    } catch (error: any) {
      toast.error(`Error al cargar usuarios: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };
  
  const handleRoleClick = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role === 'admin' ? 'user' : 'admin');
    setShowRoleModal(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      // Delete user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(
        selectedUser.id
      );
      
      if (authError) throw authError;
      
      // Delete user from users table
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      
      toast.success('Usuario eliminado correctamente');
      setUsers(users.filter(u => u.id !== selectedUser.id));
    } catch (error: any) {
      toast.error(`Error al eliminar usuario: ${error.message}`);
    } finally {
      setShowDeleteModal(false);
      setSelectedUser(null);
    }
  };
  
  const confirmRoleChange = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      
      toast.success(`Rol actualizado a ${newRole}`);
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, role: newRole } : u
      ));
    } catch (error: any) {
      toast.error(`Error al actualizar rol: ${error.message}`);
    } finally {
      setShowRoleModal(false);
      setSelectedUser(null);
    }
  };
  
  const columns = [
    {
      header: 'Email',
      accessor: 'email'
    },
    {
      header: 'Rol',
      accessor: (user: User) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {user.role === 'admin' ? 'Administrador' : 'Usuario'}
        </span>
      )
    },
    {
      header: 'Fecha de Registro',
      accessor: (user: User) => new Date(user.created_at).toLocaleDateString()
    },
    {
      header: 'Acciones',
      accessor: (user: User) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleRoleClick(user);
            }}
            leftIcon={<UserCog size={16} />}
          >
            Cambiar Rol
          </Button>
          
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(user);
            }}
            leftIcon={<Trash2 size={16} />}
          >
            Eliminar
          </Button>
        </div>
      ),
      className: 'w-auto'
    }
  ];
  
  return (
    <Card title="Gestión de Usuarios">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-medium">Usuarios Registrados</h2>
        <Button
          variant="primary"
          leftIcon={<UserPlus size={18} />}
          onClick={() => {/* Implementar creación de usuario */}}
        >
          Nuevo Usuario
        </Button>
      </div>
      
      <Table
        columns={columns}
        data={users}
        keyExtractor={(user) => user.id}
        isLoading={loading}
        emptyMessage="No hay usuarios registrados"
      />
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Eliminación"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              Eliminar
            </Button>
          </div>
        }
      >
        <p>¿Está seguro que desea eliminar al usuario {selectedUser?.email}?</p>
        <p className="mt-2 text-sm text-gray-500">Esta acción no se puede deshacer y eliminará todos los datos asociados a este usuario.</p>
      </Modal>
      
      {/* Change Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Cambiar Rol de Usuario"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowRoleModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={confirmRoleChange}
            >
              Guardar Cambios
            </Button>
          </div>
        }
      >
        <p>Cambiar el rol de <strong>{selectedUser?.email}</strong> a:</p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="role-user"
              name="role"
              value="user"
              checked={newRole === 'user'}
              onChange={() => setNewRole('user')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="role-user" className="ml-2 block text-sm text-gray-900">
              Usuario
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="role-admin"
              name="role"
              value="admin"
              checked={newRole === 'admin'}
              onChange={() => setNewRole('admin')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="role-admin" className="ml-2 block text-sm text-gray-900">
              Administrador
            </label>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Los administradores tienen acceso a todas las funciones de la aplicación, incluyendo la gestión de usuarios.
        </p>
      </Modal>
    </Card>
  );
};

export default UserList;