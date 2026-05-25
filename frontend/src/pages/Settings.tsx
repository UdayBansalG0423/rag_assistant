import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, User, Lock, Bell, FolderTree, Bot, Link as LinkIcon, 
  CreditCard, BarChart3, Camera, Trash2 
} from 'lucide-react'
import { Button, Input, Badge } from '@/components/ui'
import { cn } from '@/utils/cn'

type SettingsTab = 'profile' | 'security' | 'notifications' | 'documents' | 'ai' | 'integrations' | 'billing' | 'usage'

export default function Settings() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  const navItems = [
    { group: 'Account', items: [
      { id: 'profile' as SettingsTab, icon: User, label: 'Profile' },
      { id: 'security' as SettingsTab, icon: Lock, label: 'Security' },
      { id: 'notifications' as SettingsTab, icon: Bell, label: 'Notifications' },
    ]},
    { group: 'Workspace', items: [
      { id: 'documents' as SettingsTab, icon: FolderTree, label: 'Documents' },
      { id: 'ai' as SettingsTab, icon: Bot, label: 'AI Preferences' },
      { id: 'integrations' as SettingsTab, icon: LinkIcon, label: 'Integrations' },
    ]},
    { group: 'Billing', items: [
      { id: 'billing' as SettingsTab, icon: CreditCard, label: 'Plan & Billing' },
      { id: 'usage' as SettingsTab, icon: BarChart3, label: 'Usage' },
    ]},
  ]

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <header className="h-12 bg-bg-surface border-b border-border-subtle flex items-center px-4">
        <button 
          onClick={() => navigate('/workspace')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back to Chat</span>
        </button>
      </header>

      <div className="flex">
        {/* Sidebar Nav */}
        <nav className="w-64 h-[calc(100vh-48px)] bg-bg-surface border-r border-border-subtle p-4 overflow-y-auto">
          {navItems.map((group) => (
            <div key={group.group} className="mb-6">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2">
                {group.group}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                      activeTab === item.id
                        ? 'bg-bg-elevated text-text-primary'
                        : 'text-text-secondary hover:bg-bg-overlay hover:text-text-primary'
                    )}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Content Area */}
        <main className="flex-1 p-8 max-w-2xl">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'ai' && <AISettings />}
          {activeTab === 'billing' && <BillingSettings />}
          {activeTab === 'documents' && <DocumentsSettings />}
          {activeTab === 'notifications' && <NotificationsSettings />}
          {activeTab === 'integrations' && <IntegrationsSettings />}
          {activeTab === 'usage' && <UsageSettings />}
        </main>
      </div>
    </div>
  )
}

function ProfileSettings() {
  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-text-primary mb-6">Profile</h2>
      
      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-accent-primary/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-accent-primary">U</span>
          </div>
          <button className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={20} className="text-white" />
          </button>
        </div>
        <div>
          <h3 className="font-medium text-text-primary">User Name</h3>
          <p className="text-sm text-text-muted">Click avatar to change</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <Input label="Full Name" defaultValue="User Name" />
        <Input label="Email" defaultValue="user@example.com" />
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Language</label>
          <select className="input-field w-full">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Timezone</label>
          <select className="input-field w-full">
            <option>UTC-8 (Pacific Time)</option>
            <option>UTC-5 (Eastern Time)</option>
            <option>UTC+0 (GMT)</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button>Save Changes</Button>
      </div>

      {/* Danger Zone */}
      <div className="mt-12 pt-8 border-t border-border-subtle">
        <h3 className="text-lg font-semibold text-status-error mb-2">Danger Zone</h3>
        <p className="text-sm text-text-secondary mb-4">Once you delete your account, there is no going back.</p>
        <Button variant="danger" className="flex items-center gap-2">
          <Trash2 size={16} />
          Delete Account
        </Button>
      </div>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-text-primary mb-6">Security</h2>
      
      <div className="space-y-6">
        <div className="card p-6">
          <h3 className="font-medium text-text-primary mb-2">Password</h3>
          <p className="text-sm text-text-secondary mb-4">Last changed 30 days ago</p>
          <Button variant="secondary">Change Password</Button>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-text-primary mb-1">Two-Factor Authentication</h3>
              <p className="text-sm text-text-secondary">Add an extra layer of security to your account</p>
            </div>
            <Badge variant="ready">Enabled</Badge>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-medium text-text-primary mb-4">Active Sessions</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-status-ready" />
                <div>
                  <p className="text-sm text-text-primary">Chrome on Windows</p>
                  <p className="text-xs text-text-muted">Current session</p>
                </div>
              </div>
              <span className="text-xs text-text-muted">Now</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-status-ready" />
                <div>
                  <p className="text-sm text-text-primary">Safari on macOS</p>
                  <p className="text-xs text-text-muted">San Francisco, CA</p>
                </div>
              </div>
              <span className="text-xs text-text-muted">2 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AISettings() {
  const [responseStyle, setResponseStyle] = useState('balanced')
  const [showCitations, setShowCitations] = useState('always')

  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-text-primary mb-6">AI Preferences</h2>
      
      <div className="space-y-6">
        <div className="card p-6">
          <h3 className="font-medium text-text-primary mb-4">Default Model</h3>
          <div className="grid grid-cols-2 gap-3">
            {['NeuralDoc Fast', 'NeuralDoc Pro', 'NeuralDoc Ultra', 'Custom API'].map((model) => (
              <button
                key={model}
                className="p-4 rounded-lg border border-border-default hover:border-accent-primary transition-colors text-left"
              >
                <p className="text-sm font-medium text-text-primary">{model}</p>
                <p className="text-xs text-text-muted mt-1">Best for general use</p>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-medium text-text-primary mb-4">Response Style</h3>
          <div className="flex gap-2">
            {['concise', 'balanced', 'detailed'].map((style) => (
              <button
                key={style}
                onClick={() => setResponseStyle(style)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  responseStyle === style
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-overlay text-text-secondary hover:text-text-primary'
                )}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-medium text-text-primary mb-4">Citation Display</h3>
          <div className="flex gap-2">
            {['always', 'on-hover', 'never'].map((option) => (
              <button
                key={option}
                onClick={() => setShowCitations(option)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  showCitations === option
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-overlay text-text-secondary hover:text-text-primary'
                )}
              >
                {option.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function BillingSettings() {
  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-text-primary mb-6">Plan & Billing</h2>
      
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-text-primary">Current Plan</h3>
            <p className="text-sm text-text-muted">Next billing date: Feb 15, 2025</p>
          </div>
          <Badge>Pro Plan</Badge>
        </div>
        <div className="text-3xl font-display font-bold text-text-primary">$19<span className="text-lg text-text-muted font-normal">/month</span></div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-secondary">Documents</span>
            <span className="text-text-muted">12 / 100</span>
          </div>
          <div className="h-2 bg-bg-overlay rounded-full overflow-hidden">
            <div className="h-full w-[12%] bg-accent-primary rounded-full" />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-secondary">Storage</span>
            <span className="text-text-muted">2.4 GB / 10 GB</span>
          </div>
          <div className="h-2 bg-bg-overlay rounded-full overflow-hidden">
            <div className="h-full w-[24%] bg-accent-primary rounded-full" />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-secondary">API Calls</span>
            <span className="text-text-muted">1,234 / 10,000</span>
          </div>
          <div className="h-2 bg-bg-overlay rounded-full overflow-hidden">
            <div className="h-full w-[12%] bg-accent-primary rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

function DocumentsSettings() {
  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-text-primary mb-6">Documents</h2>
      <p className="text-text-secondary mb-6">Manage your uploaded documents and workspaces.</p>
      <Button>Manage Documents</Button>
    </div>
  )
}

function NotificationsSettings() {
  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-text-primary mb-6">Notifications</h2>
      <div className="space-y-4">
        {['Email notifications', 'Push notifications', 'Document ready alerts', 'Weekly digest'].map((item) => (
          <div key={item} className="card p-4 flex items-center justify-between">
            <span className="text-sm text-text-primary">{item}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-bg-overlay peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

function IntegrationsSettings() {
  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-text-primary mb-6">Integrations</h2>
      <div className="space-y-4">
        {['Google Drive', 'Slack', 'Notion', 'GitHub'].map((integration) => (
          <div key={integration} className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-bg-overlay flex items-center justify-center">
                <span className="text-lg">{integration[0]}</span>
              </div>
              <span className="text-sm text-text-primary">{integration}</span>
            </div>
            <Button variant="secondary" size="sm">Connect</Button>
          </div>
        ))}
      </div>
    </div>
  )
}

function UsageSettings() {
  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-text-primary mb-6">Usage</h2>
      <div className="card p-6">
        <h3 className="font-medium text-text-primary mb-4">API Usage (Last 30 days)</h3>
        <div className="h-40 bg-bg-overlay rounded-lg flex items-end justify-around p-4">
          {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 95].map((h, i) => (
            <div key={i} className="w-8 bg-accent-primary/50 rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
