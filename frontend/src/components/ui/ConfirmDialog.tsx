import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
  onCancel?: () => void
  loading?: boolean
  isDestructive?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  onCancel,
  loading = false,
  isDestructive = false,
}) => {
  const handleClose = () => {
    onCancel?.()
    onClose()
  }

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} decorated={false}>
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className={`icon-medal !w-10 !h-10 flex-shrink-0 ${
            variant === 'danger' ? '!border-danger' : variant === 'warning' ? '!border-warning' : ''
          }`}>
            <AlertTriangle className={`w-5 h-5 ${
              variant === 'danger' ? 'text-danger' : variant === 'warning' ? 'text-warning' : 'text-gold'
            }`} />
          </div>
          <p className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
            {message}
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose} disabled={loading}>{cancelText}</Button>
          <Button
            variant={isDestructive || variant === 'danger' ? 'danger' : 'gold'}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Aguarde...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
