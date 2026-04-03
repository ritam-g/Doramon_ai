import React from 'react';

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join(' ');
}

export function ProfileHeader({ profile, stats, onEditAvatar }) {
  const initials = getInitials(profile.fullName || 'Neural Operator');

  return (
    <section className="profile-header relative overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(145deg,rgba(18,28,42,0.92),rgba(10,18,32,0.82))] p-6 shadow-[0_28px_90px_rgba(4,10,24,0.3)] backdrop-blur-xl sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_28%)]" />

      <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
          <div className="relative">
            <div className="profile-header-avatar flex h-36 w-36 items-center justify-center overflow-hidden rounded-[2rem] border border-primary/20 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_34%),linear-gradient(145deg,rgba(34,211,238,0.35),rgba(59,130,246,0.18),rgba(15,23,42,0.92))] text-4xl font-black text-white shadow-[0_30px_70px_rgba(8,145,178,0.24)] sm:h-40 sm:w-40 sm:text-5xl">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <button
              type="button"
              onClick={onEditAvatar}
              className="profile-header-avatar-edit absolute bottom-3 right-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-[linear-gradient(135deg,rgba(34,211,238,0.92),rgba(59,130,246,0.94))] text-slate-950 shadow-[0_18px_40px_rgba(56,189,248,0.28)] transition duration-300 hover:scale-[1.04] active:scale-95"
              aria-label="Edit avatar"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300/70">
                {profile.roleLabel}
              </p>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                {profile.fullName}
              </h1>
              <p className="text-lg font-medium text-cyan-300">@{profile.username}</p>
              <p className="text-sm text-slate-400">{profile.subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <div className="profile-header-pill inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
                <span className="material-symbols-outlined text-[18px] text-slate-400">calendar_month</span>
                <span>{profile.joinedLabel}</span>
              </div>

              <div className="profile-header-pill inline-flex items-center gap-2 rounded-full border border-primary/25 bg-cyan-400/5 px-4 py-2 text-sm font-semibold text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                <span>{profile.badgeLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-header-stats grid gap-3 sm:grid-cols-2 xl:min-w-[18rem]">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.5rem] border border-white/8 bg-black/20 px-5 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <p className="text-2xl font-black tracking-tight text-white sm:text-3xl">{stat.value}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
