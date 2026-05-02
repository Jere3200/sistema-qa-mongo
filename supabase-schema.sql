-- ============================================================
-- RQA-Tracer — Schema Supabase
-- Pegar completo en Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ── FASE 1: CREAR TODAS LAS TABLAS ──────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre     TEXT NOT NULL DEFAULT '',
  email      TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  status      TEXT DEFAULT 'active' CHECK (status IN ('active','archived','completed')),
  owner_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_members (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role        TEXT DEFAULT 'editor' CHECK (role IN ('owner','editor','viewer')),
  invited_by  UUID REFERENCES public.profiles(id),
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.modules (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  "order"     INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_stories (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  module_id   UUID REFERENCES public.modules(id) ON DELETE SET NULL,
  code        TEXT NOT NULL DEFAULT '',
  title       TEXT NOT NULL,
  as_a        TEXT DEFAULT '',
  i_want      TEXT DEFAULT '',
  so_that     TEXT DEFAULT '',
  status      TEXT DEFAULT 'backlog' CHECK (status IN ('backlog','in-progress','testing','done')),
  priority    TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.acceptance_criteria (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_story_id UUID REFERENCES public.user_stories(id) ON DELETE CASCADE NOT NULL,
  description   TEXT NOT NULL,
  "order"       INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.test_cases (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id    UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_story_id UUID REFERENCES public.user_stories(id) ON DELETE CASCADE NOT NULL,
  code          TEXT NOT NULL DEFAULT '',
  title         TEXT NOT NULL,
  preconditions TEXT DEFAULT '',
  given_step    TEXT DEFAULT '',
  when_step     TEXT DEFAULT '',
  then_step     TEXT DEFAULT '',
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','passed','failed','blocked')),
  priority      TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  executed_at   TIMESTAMPTZ,
  executed_by   TEXT,
  notes         TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ── FASE 2: HABILITAR RLS EN TODAS LAS TABLAS ───────────────

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acceptance_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages    ENABLE ROW LEVEL SECURITY;


-- ── FASE 3: POLÍTICAS RLS (todas las tablas ya existen) ──────

-- profiles
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- projects (referencia project_members — tabla ya creada)
CREATE POLICY "projects_select" ON public.projects FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR id IN (
    SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
  ));
CREATE POLICY "projects_insert" ON public.projects FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "projects_update" ON public.projects FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR id IN (
    SELECT project_id FROM public.project_members WHERE user_id = auth.uid() AND role IN ('owner','editor')
  ));
CREATE POLICY "projects_delete" ON public.projects FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- project_members
CREATE POLICY "members_select" ON public.project_members FOR SELECT TO authenticated
  USING (project_id IN (
    SELECT id FROM public.projects WHERE owner_id = auth.uid()
    UNION
    SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
  ));
CREATE POLICY "members_insert" ON public.project_members FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid())
    OR user_id = auth.uid()
  );
CREATE POLICY "members_delete" ON public.project_members FOR DELETE TO authenticated
  USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));

-- modules
CREATE POLICY "modules_all" ON public.modules FOR ALL TO authenticated
  USING (project_id IN (
    SELECT id FROM public.projects WHERE owner_id = auth.uid()
    UNION
    SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
  ));

-- user_stories
CREATE POLICY "stories_all" ON public.user_stories FOR ALL TO authenticated
  USING (project_id IN (
    SELECT id FROM public.projects WHERE owner_id = auth.uid()
    UNION
    SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
  ));

-- acceptance_criteria
CREATE POLICY "criteria_all" ON public.acceptance_criteria FOR ALL TO authenticated
  USING (user_story_id IN (
    SELECT id FROM public.user_stories WHERE project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
    )
  ));

-- test_cases
CREATE POLICY "test_cases_all" ON public.test_cases FOR ALL TO authenticated
  USING (project_id IN (
    SELECT id FROM public.projects WHERE owner_id = auth.uid()
    UNION
    SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
  ));

-- chat_messages
CREATE POLICY "chat_all" ON public.chat_messages FOR ALL TO authenticated
  USING (project_id IN (
    SELECT id FROM public.projects WHERE owner_id = auth.uid()
    UNION
    SELECT project_id FROM public.project_members WHERE user_id = auth.uid()
  ));


-- ── FASE 4: FUNCIONES Y TRIGGERS ────────────────────────────

-- Trigger: crear profile al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    new.email
  );
  RETURN new;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger: añadir owner como miembro al crear proyecto
CREATE OR REPLACE FUNCTION auto_add_project_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (new.id, new.owner_id, 'owner');
  RETURN new;
END;
$$;
DROP TRIGGER IF EXISTS on_project_created ON public.projects;
CREATE TRIGGER on_project_created
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION auto_add_project_owner();

-- Trigger: auto-generar código US-001
CREATE OR REPLACE FUNCTION generate_user_story_code()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE next_num INTEGER;
BEGIN
  IF new.code = '' OR new.code IS NULL THEN
    SELECT COALESCE(MAX(CAST(REGEXP_REPLACE(code, 'US-', '') AS INTEGER)), 0) + 1
    INTO next_num
    FROM public.user_stories WHERE project_id = new.project_id;
    new.code := 'US-' || LPAD(next_num::TEXT, 3, '0');
  END IF;
  RETURN new;
END;
$$;
DROP TRIGGER IF EXISTS set_user_story_code ON public.user_stories;
CREATE TRIGGER set_user_story_code
  BEFORE INSERT ON public.user_stories
  FOR EACH ROW EXECUTE FUNCTION generate_user_story_code();

-- Trigger: auto-generar código TC-001
CREATE OR REPLACE FUNCTION generate_test_case_code()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE next_num INTEGER;
BEGIN
  IF new.code = '' OR new.code IS NULL THEN
    SELECT COALESCE(MAX(CAST(REGEXP_REPLACE(code, 'TC-', '') AS INTEGER)), 0) + 1
    INTO next_num
    FROM public.test_cases WHERE project_id = new.project_id;
    new.code := 'TC-' || LPAD(next_num::TEXT, 3, '0');
  END IF;
  RETURN new;
END;
$$;
DROP TRIGGER IF EXISTS set_test_case_code ON public.test_cases;
CREATE TRIGGER set_test_case_code
  BEFORE INSERT ON public.test_cases
  FOR EACH ROW EXECUTE FUNCTION generate_test_case_code();


-- ── FASE 5: REALTIME ─────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_stories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.test_cases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
