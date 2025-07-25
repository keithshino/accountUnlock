import React, { useState } from 'react';
import Modal from './Modal';

interface RequestFormProps {
  onAddTasks: (task: {
    requesterName: string;
    requesterEmail: string;
    employees: { employeeName: string; employeeId: string }[];
  }) => void;
}

interface EmployeeInput {
  key: number;
  name: string;
  id: string;
}

interface Errors {
  requesterName?: string;
  requesterEmail?: string;
  employees?: Array<{ name?: string; id?: string } | undefined>;
}

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-500 group-hover:text-red-600 transition-colors"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const FormField: React.FC<{
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
}> = ({ label, id, value, onChange, type = 'text', error }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      className={`w-full p-3 border rounded-md shadow-sm transition-colors ${
        error
          ? 'border-red-500 bg-red-50'
          : 'border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
      }`}
    />
    {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
  </div>
);

const RequestForm: React.FC<RequestFormProps> = ({ onAddTasks }) => {
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [employees, setEmployees] = useState<EmployeeInput[]>([
    { key: Date.now(), name: '', id: '' },
  ]);

  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const handleAddEmployee = () => {
    setEmployees([...employees, { key: Date.now(), name: '', id: '' }]);
  };

  const handleRemoveEmployee = (keyToRemove: number) => {
    setEmployees(employees.filter((emp) => emp.key !== keyToRemove));
  };

  const handleEmployeeChange = (
    key: number,
    field: 'name' | 'id',
    value: string
  ) => {
    setEmployees(
      employees.map((emp) =>
        emp.key === key ? { ...emp, [field]: value } : emp
      )
    );
  };

  const validate = () => {
    const newErrors: Errors = {};
    if (!requesterName.trim())
      newErrors.requesterName = '依頼者氏名は必須です。';
    if (!requesterEmail.trim()) {
      newErrors.requesterEmail = '依頼者メールアドレスは必須です。';
    } else if (!/\S+@\S+\.\S+/.test(requesterEmail)) {
      newErrors.requesterEmail = '有効なメールアドレスを入力してください。';
    }

    let hasEmployeeErrors = false;
    const employeeErrors = employees.map((emp) => {
      const singleEmployeeErrors: { name?: string; id?: string } = {};
      if (!emp.name.trim()) {
        singleEmployeeErrors.name = '対象社員氏名は必須です。';
        hasEmployeeErrors = true;
      }
      if (!emp.id.trim()) {
        singleEmployeeErrors.id = '社員番号は必須です。';
        hasEmployeeErrors = true;
      }
      return Object.keys(singleEmployeeErrors).length > 0
        ? singleEmployeeErrors
        : undefined;
    });

    if (hasEmployeeErrors) {
      newErrors.employees = employeeErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setConfirmModalOpen(true);
    }
  };

  const handleConfirmSubmit = () => {
    onAddTasks({
      requesterName,
      requesterEmail,
      employees: employees.map((emp) => ({
        employeeName: emp.name,
        employeeId: emp.id,
      })),
    });
    setConfirmModalOpen(false);
    setRequesterName('');
    setRequesterEmail('');
    setEmployees([{ key: Date.now(), name: '', id: '' }]);
    setErrors({});
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 5000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {showSuccessAlert && (
        <div
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow"
          role="alert"
        >
          <p className="font-bold">提出完了</p>
          <p>アカウントロック解除の依頼が完了しました！</p>
        </div>
      )}
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} noValidate>
          <fieldset className="mb-6">
            <legend className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
              あなたの情報
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="依頼者氏名"
                id="requesterName"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                error={errors.requesterName}
              />
              <FormField
                label="依頼者メールアドレス"
                id="requesterEmail"
                value={requesterEmail}
                onChange={(e) => setRequesterEmail(e.target.value)}
                type="email"
                error={errors.requesterEmail}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
              ロック解除を依頼する社員の情報
            </legend>
            <div className="space-y-4">
              {employees.map((employee, index) => (
                <div
                  key={employee.key}
                  className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor={`employeeName-${employee.key}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        対象社員氏名
                      </label>
                      <input
                        type="text"
                        id={`employeeName-${employee.key}`}
                        value={employee.name}
                        onChange={(e) =>
                          handleEmployeeChange(
                            employee.key,
                            'name',
                            e.target.value
                          )
                        }
                        className={`w-full p-3 border rounded-md shadow-sm transition-colors ${
                          errors.employees?.[index]?.name
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
                        }`}
                      />
                      {errors.employees?.[index]?.name && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.employees[index]?.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor={`employeeId-${employee.key}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        社員番号
                      </label>
                      <input
                        type="text"
                        id={`employeeId-${employee.key}`}
                        value={employee.id}
                        onChange={(e) =>
                          handleEmployeeChange(
                            employee.key,
                            'id',
                            e.target.value
                          )
                        }
                        className={`w-full p-3 border rounded-md shadow-sm transition-colors ${
                          errors.employees?.[index]?.id
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
                        }`}
                      />
                      {errors.employees?.[index]?.id && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.employees[index]?.id}
                        </p>
                      )}
                    </div>
                  </div>
                  {employees.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEmployee(employee.key)}
                      className="mt-8 p-2 rounded-full hover:bg-red-100 group"
                      aria-label="Remove employee"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddEmployee}
                className="flex items-center gap-2 text-blue-600 font-semibold py-2 px-3 rounded-md hover:bg-blue-50 transition-colors"
              >
                <PlusIcon />
                <span>社員を追加</span>
              </button>
            </div>
          </fieldset>

          <div className="mt-8 text-center">
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 shadow-md"
            >
              依頼を提出する
            </button>
          </div>
        </form>
      </div>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="提出内容の確認"
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmModalOpen(false)}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              提出する
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">この内容で提出しますか？</p>
        <div className="mt-4 space-y-3 text-sm">
          <div>
            <strong>依頼者:</strong> {requesterName}
          </div>
          <div>
            <strong className="block mb-1">
              対象社員 ({employees.length}名):
            </strong>
            <ul className="list-disc list-inside bg-gray-50 p-2 rounded-md">
              {employees.map((emp) => (
                <li key={emp.key} className="text-gray-700">
                  {emp.name} (社員番号: {emp.id})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RequestForm;
