'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';

const LEVEL_RATES = {
  0: 'Root',
  1: 'Level 1 · $10/box',
  2: 'Level 2 · $8/box',
  3: 'Level 3 · $6/box',
  4: 'Level 4 · $6/box',
};

function buildTree(rootUser, downline) {
  const rootId = String(rootUser?._id || 'root');
  const rootCode = (rootUser?.referralCode || '').toUpperCase();

  const makeNode = (u, level) => ({
    id: String(u._id || u.referralCode || `${level}-${u.email}`),
    name: u.name || 'Member',
    email: u.email || '',
    referralCode: (u.referralCode || '').toUpperCase(),
    sponsorId: u.sponsorId ? String(u.sponsorId) : null,
    sponsorCode: (u.sponsorCode || '').toUpperCase() || null,
    isActive: Boolean(u.hasActiveSubscription || u.subscriptionStatus === 'active'),
    level,
    createdAt: u.createdAt,
    children: [],
  });

  const rootNode = {
    id: rootId,
    name: rootUser?.name || 'You',
    email: rootUser?.email || '',
    referralCode: rootCode,
    isActive: Boolean(rootUser?.hasActiveSubscription || rootUser?.subscriptionStatus === 'active'),
    level: 0,
    children: [],
  };

  if (!downline) return rootNode;

  const l1 = (downline.level1 || []).map((u) => makeNode(u, 1));
  const l2 = (downline.level2 || []).map((u) => makeNode(u, 2));
  const l3 = (downline.level3 || []).map((u) => makeNode(u, 3));
  const l4 = (downline.level4 || []).map((u) => makeNode(u, 4));

  const attachChildren = (parents, children) => {
    const byId = new Map(parents.map((p) => [p.id, p]));
    const byCode = new Map(parents.map((p) => [p.referralCode, p]));
    children.forEach((child) => {
      const parent =
        (child.sponsorId && byId.get(child.sponsorId)) ||
        (child.sponsorCode && byCode.get(child.sponsorCode)) ||
        parents[0];
      if (parent) {
        parent.children.push(child);
      }
    });
  };

  attachChildren(l3, l4);
  attachChildren(l2, l3);
  attachChildren(l1, l2);
  rootNode.children = l1;

  return rootNode;
}

function TreeNodeBranch({ node, collapsedMap, toggleCollapse, searchQuery }) {
  const hasChildren = node.children && node.children.length > 0;
  const isCollapsed = Boolean(collapsedMap[node.id]);

  const query = searchQuery.trim().toLowerCase();
  const isMatch =
    Boolean(query) &&
    (node.name.toLowerCase().includes(query) ||
      node.referralCode.toLowerCase().includes(query) ||
      node.email.toLowerCase().includes(query));

  return (
    <li className="genealogy-li">
      <div
        className={`genealogy-node ${node.level === 0 ? 'genealogy-node-root' : ''} ${
          isMatch ? 'genealogy-node-match' : ''
        }`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: node.level === 0 ? 'var(--amber-primary)' : 'rgba(230, 157, 69, 0.16)',
              color: node.level === 0 ? '#120c08' : 'var(--amber-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.78rem',
              fontWeight: '700',
              flexShrink: 0,
            }}
          >
            {node.name ? node.name.charAt(0).toUpperCase() : 'M'}
          </div>
          <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: '0.84rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {node.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--amber-light)' }}>
              {node.referralCode || 'MEMBER'}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px',
            paddingTop: '6px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
          }}
        >
          <span>{LEVEL_RATES[node.level]}</span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: node.isActive ? 'var(--success)' : '#f87171',
              fontWeight: '600',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: node.isActive ? 'var(--success)' : '#f87171',
              }}
            />
            {node.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {hasChildren && (
          <button
            type="button"
            onClick={() => toggleCollapse(node.id)}
            style={{
              marginTop: '8px',
              width: '100%',
              background: '#0d0907',
              border: '1px solid var(--mocha-border)',
              borderRadius: '7px',
              padding: '4px 8px',
              color: 'var(--text-secondary)',
              fontSize: '0.72rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
            <span>
              {isCollapsed
                ? `Show ${node.children.length} ${node.children.length === 1 ? 'member' : 'members'}`
                : `Hide (${node.children.length})`}
            </span>
          </button>
        )}
      </div>

      {hasChildren && !isCollapsed && (
        <ul className="genealogy-ul">
          {node.children.map((child) => (
            <TreeNodeBranch
              key={child.id}
              node={child}
              collapsedMap={collapsedMap}
              toggleCollapse={toggleCollapse}
              searchQuery={searchQuery}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function GenealogyTree({ user, downline, searchQuery = '' }) {
  const [collapsedMap, setCollapsedMap] = useState({});

  const treeData = useMemo(() => buildTree(user, downline), [user, downline]);

  const toggleCollapse = (nodeId) => {
    setCollapsedMap((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const hasAnyDownline = treeData.children && treeData.children.length > 0;

  return (
    <div
      style={{
        background: '#140e0a',
        border: '1px solid var(--mocha-border)',
        borderRadius: '16px',
        padding: '18px',
      }}
    >
      <style>{`
        .genealogy-scroll {
          overflow-x: auto;
          padding: 16px 8px 20px;
        }
        .genealogy-tree,
        .genealogy-ul {
          display: flex;
          justify-content: center;
          padding: 20px 0 0;
          margin: 0;
          list-style: none;
          position: relative;
        }
        .genealogy-tree {
          padding-top: 4px;
        }
        .genealogy-ul::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          border-left: 1px solid rgba(200, 125, 40, 0.35);
          width: 0;
          height: 20px;
        }
        .genealogy-li {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          padding: 20px 8px 0;
        }
        .genealogy-tree > .genealogy-li {
          padding-top: 0;
        }
        .genealogy-li::before,
        .genealogy-li::after {
          content: '';
          position: absolute;
          top: 0;
          right: 50%;
          border-top: 1px solid rgba(200, 125, 40, 0.35);
          width: 50%;
          height: 20px;
        }
        .genealogy-li::after {
          right: auto;
          left: 50%;
          border-left: 1px solid rgba(200, 125, 40, 0.35);
        }
        .genealogy-li:only-child::after,
        .genealogy-li:only-child::before {
          display: none;
        }
        .genealogy-li:only-child {
          padding-top: 0;
        }
        .genealogy-li:first-child::before,
        .genealogy-li:last-child::after {
          border: 0 none;
        }
        .genealogy-li:last-child::before {
          border-right: 1px solid rgba(200, 125, 40, 0.35);
          border-radius: 0 6px 0 0;
        }
        .genealogy-li:first-child::after {
          border-radius: 6px 0 0 0;
        }
        .genealogy-node {
          width: 176px;
          background: #1a120d;
          border: 1px solid var(--mocha-border);
          border-radius: 12px;
          padding: 10px 12px;
          position: relative;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
          flex-shrink: 0;
        }
        .genealogy-node-root {
          background: #1f140d;
          border-color: var(--amber-primary);
          width: 196px;
        }
        .genealogy-node-match {
          border-color: var(--amber-light);
          box-shadow: 0 0 0 2px rgba(230, 157, 69, 0.35);
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--mocha-border)',
        }}
      >
        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
          4-Level Genealogy Tree
        </div>
        {hasAnyDownline && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setCollapsedMap({})}
              style={{
                background: 'transparent',
                border: '1px solid var(--mocha-border)',
                color: 'var(--text-secondary)',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '0.76rem',
                cursor: 'pointer',
              }}
            >
              Expand All
            </button>
          </div>
        )}
      </div>

      <div className="genealogy-scroll">
        <ul className="genealogy-tree">
          <TreeNodeBranch
            node={treeData}
            collapsedMap={collapsedMap}
            toggleCollapse={toggleCollapse}
            searchQuery={searchQuery}
          />
        </ul>
      </div>

      {!hasAnyDownline && (
        <div
          style={{
            textAlign: 'center',
            padding: '12px 10px 6px',
            color: 'var(--text-muted)',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Users size={15} />
          <span>Share your referral link to grow your 4-level genealogy tree.</span>
        </div>
      )}
    </div>
  );
}

