import React from 'react'
import { motion } from 'framer-motion'
import { Building2, Network, Store, Warehouse } from 'lucide-react'

interface OrgStructureTabProps {
  companies: any[]
  branches: any[]
  stores: any[]
  warehouses: any[]
}

export const OrgStructureTab: React.FC<OrgStructureTabProps> = ({
  companies = [],
  branches = [],
  stores = [],
  warehouses = [],
}) => {
  return (
    <div className="bg-card border border-border p-6 rounded-2xl space-y-6 shadow-xs">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Network className="text-primary" size={20} />
            <span>Enterprise Hierarchy & Organizational Topology</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visual breakdown of parent companies, active branches, POS stores, and inventory storage warehouses.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {companies.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No organizational entities registered.</p>
        ) : (
          companies.map((comp: any) => {
            const compBranches = branches.filter((b: any) => b.company_id === comp.id || comp.id === 1)
            const compStores = stores.filter((s: any) => s.company_id === comp.id || comp.id === 1)
            const compWarehouses = warehouses.filter((w: any) => w.company_id === comp.id || comp.id === 1)

            return (
              <motion.div
                key={comp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-border/80 rounded-2xl p-5 bg-muted/20 space-y-4"
              >
                {/* Parent Company Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-foreground text-base">{comp.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{comp.email || comp.tax_number || 'HQ Enterprise Parent'}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold bg-primary/10 text-primary rounded-full border border-primary/20">
                    Parent Entity
                  </span>
                </div>

                {/* Branches & Subsidiaries Grid */}
                <div className="pl-6 border-l-2 border-primary/30 space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Branches & Locations ({compBranches.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {compBranches.map((br: any) => (
                      <div key={br.id} className="bg-card p-3 rounded-xl border border-border space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground text-xs">{br.name}</span>
                          <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{br.code}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{br.city || br.address || 'Local Branch'}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {/* Stores */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Store size={13} className="text-emerald-500" />
                        <span>Retail Stores ({compStores.length})</span>
                      </h4>
                      <div className="space-y-1.5">
                        {compStores.map((st: any) => (
                          <div key={st.id} className="bg-card p-2.5 rounded-xl border border-border text-xs flex justify-between items-center">
                            <span className="font-semibold text-foreground">{st.name}</span>
                            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">{st.type || 'Hybrid'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Warehouses */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Warehouse size={13} className="text-amber-500" />
                        <span>Warehouses ({compWarehouses.length})</span>
                      </h4>
                      <div className="space-y-1.5">
                        {compWarehouses.map((wh: any) => (
                          <div key={wh.id} className="bg-card p-2.5 rounded-xl border border-border text-xs flex justify-between items-center">
                            <span className="font-semibold text-foreground">{wh.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">{wh.code}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default OrgStructureTab
