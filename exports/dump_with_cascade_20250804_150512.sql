--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS events_location_floor_id_floors_id_fk;
DROP INDEX IF EXISTS CASCADE public.events_updated_at_idx;
DROP INDEX IF EXISTS CASCADE public.events_slug_idx;
DROP INDEX IF EXISTS CASCADE public.events_location_location_floor_idx;
DROP INDEX IF EXISTS CASCADE public.events_created_at_idx;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS events_pkey;
ALTER TABLE IF EXISTS public.events ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS CASCADE public.events_id_seq;
DROP TABLE IF EXISTS CASCADE public.events;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id integer NOT NULL,
    start_date timestamp(3) with time zone NOT NULL,
    end_date timestamp(3) with time zone NOT NULL,
    status public.enum_events_status DEFAULT 'ACTIVE'::public.enum_events_status NOT NULL,
    location_name character varying,
    location_address character varying,
    is_featured boolean DEFAULT false,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    slug character varying,
    slug_lock boolean DEFAULT true,
    highlight character varying,
    section_highlight character varying,
    short_alphabet character varying,
    show_time character varying,
    sort_order numeric,
    location_floor_id integer,
    location_zone character varying,
    promotion_type public.enum_events_promotion_type,
    system_original_id numeric,
    system_cid numeric,
    system_scid numeric,
    system_create_by character varying,
    system_modified_at timestamp(3) with time zone
);


--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.events (id, start_date, end_date, status, location_name, location_address, is_featured, updated_at, created_at, slug, slug_lock, highlight, section_highlight, short_alphabet, show_time, sort_order, location_floor_id, location_zone, promotion_type, system_original_id, system_cid, system_scid, system_create_by, system_modified_at) FROM stdin;
124	2019-04-27 00:00:00+00	2019-04-28 00:00:00+00	ACTIVE			f	2025-08-03 13:20:24.853+00	2025-06-21 17:28:26.589+00	iconsiam-world-of-edutainment	t	0	0			30	\N		none	30	\N	\N	Admin	2023-12-14 00:00:00+00
113	2019-01-26 00:00:00+00	2019-02-28 00:00:00+00	INACTIVE	River Park	River Park	f	2025-08-03 13:19:38.532+00	2025-06-21 17:28:04.084+00	iconicduo-mei-ti-sheng-guang-shui-ying-biao-yanshe-ying-da-sai-kai-shi-la	t	0	0		18.30 / 20.00 /	15	\N	River Park	none	15	\N	\N	Admin	2023-12-14 00:00:00+00
142	2019-09-07 00:00:00+00	2019-09-08 00:00:00+00	ACTIVE			f	2025-06-25 18:35:47.703+00	2025-06-21 17:29:13.596+00	art-and-play-in-the-park	t	0	0		16.30-18.30	68	\N		none	68	\N	\N	Admin	2023-12-14 00:00:00+00
374	2024-10-01 12:00:00+00	2024-10-11 12:00:00+00	ACTIVE	\N	\N	f	2025-08-03 13:22:41.985+00	2025-08-03 09:48:31.711+00	iconsiam-j-licious	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
114	2019-01-28 00:00:00+00	2019-02-06 00:00:00+00	ACTIVE	SookSiam	SookSiam	f	2025-08-03 13:19:39.056+00	2025-06-21 17:28:06.004+00	sooksiam-chinese-newyear-2019	t	0	0			16	\N	SookSiam	none	16	\N	\N	Admin	2023-12-14 00:00:00+00
381	2025-01-25 12:00:00+00	2025-06-30 12:00:00+00	ACTIVE	\N	\N	f	2025-08-03 13:22:49.271+00	2025-08-03 11:00:24.582+00	the-little-prince-universe-an-immersive-journey	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
115	2019-02-02 00:00:00+00	2019-02-05 00:00:00+00	ACTIVE			f	2025-08-03 13:19:40.151+00	2025-06-21 17:28:07.516+00	chinese-newyear-make-up	t	0	0		10:30 - 21:00	17	\N		none	17	\N	\N	Admin	2023-12-14 00:00:00+00
143	2019-09-25 00:00:00+00	2019-12-12 00:00:00+00	ACTIVE			f	2025-08-03 13:20:28.797+00	2025-06-21 17:29:15.083+00	the-royal-barge-procession-exhibition	t	0	0			69	\N		none	69	\N	\N	Admin	2023-12-14 00:00:00+00
116	2019-02-02 00:00:00+00	2019-02-05 00:00:00+00	ACTIVE			f	2025-08-03 13:19:41.236+00	2025-06-21 17:28:09.36+00	cny-fortune-telling-and-workshops	t	0	0		10:00 - 22:00	18	\N		none	18	\N	\N	Admin	2023-12-14 00:00:00+00
388	2025-06-02 12:00:00+00	2025-06-30 12:00:00+00	ACTIVE	\N	\N	f	2025-08-03 13:22:54.049+00	2025-08-03 11:33:06.107+00	wisher-where-miracles-happen	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
150	2019-10-10 00:00:00+00	2019-11-04 00:00:00+00	ACTIVE			f	2025-08-03 13:20:37.408+00	2025-06-21 17:29:30.195+00	the-jim-thompson-pop-up-space	t	0	0			80	\N		none	80	\N	\N	Admin	2023-12-14 00:00:00+00
117	2019-02-02 00:00:00+00	2019-02-05 00:00:00+00	ACTIVE			f	2025-08-03 13:19:42.462+00	2025-06-21 17:28:10.876+00	cny-charoennakorn-hall	t	0	0		10:00 - 20:00	19	\N		none	19	\N	\N	Admin	2023-12-14 00:00:00+00
171	2020-02-21 00:00:00+00	2020-03-01 00:00:00+00	ACTIVE			f	2025-08-03 13:21:07.313+00	2025-06-21 17:30:14.838+00	thai-tiew-thai	t	0	0			103	\N		none	103	\N	\N	Admin	2023-07-12 00:00:00+00
101	2018-11-30 00:00:00+00	2019-01-31 00:00:00+00	ACTIVE			f	2025-08-03 13:19:19.964+00	2025-06-21 17:27:42.838+00	bangkok-illumination-at-iconsiam	t	0	0		11:00-22:00	3	\N		none	3	\N	\N	Admin	2023-12-14 00:00:00+00
118	2019-02-02 00:00:00+00	2019-02-05 00:00:00+00	ACTIVE	River Park	River Park	f	2025-08-03 13:19:43.648+00	2025-06-21 17:28:12.502+00	cny-world-class-and-spectacular-performances	t	0	0		10:00 - 22:00	20	\N	River Park	none	20	\N	\N	Admin	2023-12-14 00:00:00+00
103	2019-01-01 00:00:00+00	2019-01-01 00:00:00+00	ACTIVE	Kids Avenue	Kids Avenue	f	2025-08-03 13:19:22.556+00	2025-06-21 17:27:46.734+00	event-12	t	0	0			5	\N	Kids Avenue	none	5	\N	\N	Admin	2023-12-14 00:00:00+00
390	2025-03-01 12:00:00+00	2025-05-31 12:00:00+00	ACTIVE	\N	\N	f	2025-08-03 13:25:14.319+00	2025-08-03 13:14:52.824+00	iconic-summer-at-iconsiam	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
104	2018-11-09 00:00:00+00	2019-01-20 00:00:00+00	ACTIVE	ICONCRAFT	ICONCRAFT	f	2025-08-03 13:19:24.266+00	2025-06-21 17:27:48.158+00	event-14	t	0	0			6	\N	ICONCRAFT	none	6	\N	\N	Admin	2023-12-14 00:00:00+00
105	2018-12-08 00:00:00+00	2019-01-20 00:00:00+00	ACTIVE			f	2025-08-03 13:19:25.904+00	2025-06-21 17:27:49.685+00	event-9	t	0	0			7	\N		none	7	\N	\N	Admin	2023-12-14 00:00:00+00
120	2019-02-12 00:00:00+00	2019-02-17 00:00:00+00	ACTIVE			f	2025-08-03 13:19:47.409+00	2025-06-21 17:28:15.896+00	klongsan-with-love-at-iconsiam	t	0	0		12:00 - 18:00	22	\N		none	22	\N	\N	Admin	2023-12-14 00:00:00+00
107	2019-01-09 00:00:00+00	2019-01-13 00:00:00+00	ACTIVE			f	2025-08-03 13:19:28.858+00	2025-06-21 17:27:52.973+00	iconic-childrens-playground-at-iconsiam	t	0	0		10:30 - 22:00	9	\N		none	9	\N	\N	Admin	2023-12-14 00:00:00+00
123	2019-04-19 00:00:00+00	2019-04-23 00:00:00+00	INACTIVE			f	2025-08-03 13:19:51.208+00	2025-06-21 17:28:24.79+00	the-iconic-siamese-fighting-fish-at-iconsiam	t	0	0			29	\N		none	29	\N	\N	Admin	2023-12-14 00:00:00+00
108	2019-02-02 00:00:00+00	2019-02-05 00:00:00+00	ACTIVE			f	2025-08-03 13:19:30.802+00	2025-06-21 17:27:54.863+00	iconsiam-chinese-new-year-2019	t	0	0		10:30 - 22:00	10	\N		none	10	\N	\N	Admin	2023-12-14 00:00:00+00
109	2019-01-12 00:00:00+00	2019-01-13 00:00:00+00	ACTIVE			f	2025-08-03 13:19:31.948+00	2025-06-21 17:27:56.701+00	the-dyson-technology-experience	t	0	0			11	\N		none	11	\N	\N	Admin	2023-12-14 00:00:00+00
110	2019-01-25 00:00:00+00	2019-01-27 00:00:00+00	INACTIVE	River Park	River Park	f	2025-08-03 13:19:33.627+00	2025-06-21 17:27:58.59+00	grand-opening-of-the-iconic-multimedia-water-features	t	0	0		16.30, 18:30, 2	12	\N	River Park	none	12	\N	\N	Admin	2023-12-14 00:00:00+00
126	2019-05-17 00:00:00+00	2019-06-02 00:00:00+00	ACTIVE	SookSiam	SookSiam	f	2025-08-03 13:19:56.766+00	2025-06-21 17:28:30.117+00	amazing-thai-fruit-paradise	t	0	0			32	\N	SookSiam	none	32	\N	\N	Admin	2023-12-14 00:00:00+00
127	2019-05-16 00:00:00+00	2019-05-26 00:00:00+00	ACTIVE			f	2025-08-03 13:19:57.382+00	2025-06-21 17:28:32.035+00	celebrating-the-coronation	t	0	0			33	\N		none	33	\N	\N	Admin	2023-12-14 00:00:00+00
129	2019-06-08 00:00:00+00	2019-06-09 00:00:00+00	ACTIVE			f	2025-08-03 13:19:59.817+00	2025-06-21 17:28:35.951+00	toyota-signature-coffee	t	0	0		10.30am. - 21.0	36	\N		none	36	\N	\N	Admin	2023-12-14 00:00:00+00
111	2019-01-24 00:00:00+00	2019-01-24 00:00:00+00	ACTIVE			f	2025-08-03 13:19:35.311+00	2025-06-21 17:28:00.399+00	love-by-cathy-doll	t	0	0		18.00 – 20.00 น	13	\N		none	13	\N	\N	Admin	2023-12-14 00:00:00+00
112	2019-01-26 00:00:00+00	2019-01-27 00:00:00+00	ACTIVE			f	2025-08-03 13:19:36.95+00	2025-06-21 17:28:02.224+00	klongsan-fest-2019	t	0	0		10:00 - 20:00	14	\N		none	14	\N	\N	Admin	2023-12-14 00:00:00+00
132	2019-06-12 00:00:00+00	2019-07-21 00:00:00+00	ACTIVE	Dining on 5th,Dining on 4th,The Veranda,SookSiam	Dining on 5th,Dining on 4th,The Veranda,SookSiam	f	2025-08-03 13:20:05.538+00	2025-06-21 17:28:41.712+00	wondrous-things-at-iconsiam-wondrous-dining-2019	t	0	0		10:00 - 22:00	40	\N	Dining on 5th,Dining on 4th,The Veranda,SookSiam	none	40	\N	\N	Admin	2023-12-14 00:00:00+00
133	2019-06-20 00:00:00+00	2019-06-23 00:00:00+00	ACTIVE	River Park	River Park	f	2025-08-03 13:20:06.606+00	2025-06-21 17:28:43.455+00	toy-town-2019	t	0	0		10:00 - 20:00	41	\N	River Park	none	41	\N	\N	Admin	2023-12-14 00:00:00+00
134	2019-06-29 00:00:00+00	2019-06-29 00:00:00+00	ACTIVE	River Park	River Park	f	2025-08-03 13:20:09.435+00	2025-06-21 17:28:46.844+00	celebrate-us-thai-friendship	t	0	0		18.30	44	\N	River Park	none	44	\N	\N	Admin	2023-12-14 00:00:00+00
135	2019-07-02 00:00:00+00	2019-07-02 00:00:00+00	ACTIVE	River Park	River Park	f	2025-08-03 13:20:11.066+00	2025-06-21 17:28:48.618+00	viva-asean	t	0	0		17:00 	45	\N	River Park	none	45	\N	\N	Admin	2023-12-14 00:00:00+00
136	2019-07-12 00:00:00+00	2019-07-17 00:00:00+00	ACTIVE			f	2025-08-03 13:20:12.801+00	2025-06-21 17:28:51.171+00	the-iconic-candle-festival	t	0	0		13.00	47	\N		none	47	\N	\N	Admin	2023-12-14 00:00:00+00
137	2019-08-08 00:00:00+00	2019-08-12 00:00:00+00	ACTIVE			f	2025-08-03 13:20:15.849+00	2025-06-21 17:28:57.347+00	thai-treasures	t	0	0		10:00-22:00	53	\N		none	53	\N	\N	Admin	2023-12-14 00:00:00+00
139	2019-08-17 00:00:00+00	2019-08-17 00:00:00+00	ACTIVE			f	2025-08-03 13:20:17.652+00	2025-06-21 17:29:00.583+00	iconcraft-with-mug-painting	t	0	0		13.30 – 15.30 	55	\N		none	55	\N	\N	Admin	2023-12-14 00:00:00+00
138	2019-08-11 00:00:00+00	2019-08-11 00:00:00+00	ACTIVE			f	2025-06-25 18:35:34.646+00	2025-06-21 17:28:59.025+00	iconcraft-mother-day	t	0	0		13:00 - 16:00	54	\N		none	54	\N	\N	Admin	2023-12-14 00:00:00+00
140	2019-08-24 00:00:00+00	2019-08-24 00:00:00+00	ACTIVE			f	2025-08-03 13:20:18.772+00	2025-06-21 17:29:02.161+00	iconcraft-with-rice-sachets	t	0	0		13.30 – 15.30	56	\N		none	56	\N	\N	Admin	2023-12-14 00:00:00+00
130	2019-06-08 00:00:00+00	2019-07-31 00:00:00+00	ACTIVE	ICON Education	ICON Education	f	2025-08-03 13:20:20.694+00	2025-06-21 17:28:37.72+00	iconsiam-world-of-edutainment-2	t	0	0		10:00 - 20:00 	37	\N	ICON Education	none	37	\N	\N	Admin	2023-12-14 00:00:00+00
389	2023-04-11 12:00:00+00	2023-04-17 12:00:00+00	ACTIVE	\N	\N	f	2025-08-03 13:22:14.055+00	2025-08-03 11:45:21.599+00	yu-xian-luo-tian-di-iconsiamtong-qing-2023nian-tai-li-xin-nian-po-shui-jie	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
172	2020-02-28 00:00:00+00	2020-03-01 00:00:00+00	ACTIVE			f	2025-08-03 13:21:08.38+00	2025-06-21 17:30:16.868+00	thai-hai-thai	t	0	0		10:00 - 22:00	104	\N		none	104	\N	\N	Admin	2023-07-12 00:00:00+00
224	2023-10-11 00:00:00+00	2023-10-23 00:00:00+00	ACTIVE			f	2025-08-03 13:22:17.425+00	2025-06-21 17:33:26.863+00	vegetarian-food-festival-2023	t	0	0			207	\N		none	207	\N	\N		2023-10-16 00:00:00+00
173	2020-02-21 00:00:00+00	2020-05-31 00:00:00+00	ACTIVE	SookSiam	SookSiam	f	2025-08-03 13:21:09.493+00	2025-06-21 17:30:20.03+00	thai-supports-thai-20-baht-20	t	0	0			105	\N	SookSiam	none	105	\N	\N	Admin	2023-07-12 00:00:00+00
367	2025-06-27 12:00:00+00	2025-08-15 12:00:00+00	ACTIVE	River Park	\N	f	2025-08-03 13:22:55.222+00	2025-07-12 09:47:09.478+00	yuyuan-lantern-festival-2025	t	\N		\N	\N	\N	26	\N	\N	\N	\N	\N	\N	\N
174	2020-06-08 00:00:00+00	2020-06-14 00:00:00+00	ACTIVE			f	2025-08-03 13:21:10.602+00	2025-06-21 17:30:22.294+00	iconsiam-horoscope	t	0	0		11:00 - 19:00	106	\N		none	106	\N	\N	Admin	2023-07-12 00:00:00+00
382	2025-02-01 12:00:00+00	2025-02-28 12:00:00+00	ACTIVE	\N	\N	f	2025-08-03 15:37:44.235+00	2025-08-03 11:04:48.868+00	iconsiam-dating-destination	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
175	2020-07-03 00:00:00+00	2020-07-06 00:00:00+00	ACTIVE			f	2025-08-03 13:21:12.349+00	2025-06-21 17:30:23.879+00	iconsiam-prayer-festival	t	0	0		10:00 - 21:00	107	\N		none	107	\N	\N	Admin	2023-07-12 00:00:00+00
176	2020-07-07 00:00:00+00	2020-07-14 00:00:00+00	ACTIVE			f	2025-08-03 13:21:14.389+00	2025-06-21 17:30:25.96+00	iconsiam-happy-health-market	t	0	0		10:00 - 22:00	108	\N		none	108	\N	\N	Admin	2023-07-12 00:00:00+00
177	2020-07-09 00:00:00+00	2020-07-15 00:00:00+00	ACTIVE	SookSiam	SookSiam	f	2025-08-03 13:21:14.936+00	2025-06-21 17:30:28.131+00	authentic-herbs-and-spa	t	0	0		10:00 - 22:00	109	\N	SookSiam	none	109	\N	\N	Admin	2023-07-12 00:00:00+00
145	2019-09-26 00:00:00+00	2019-10-07 00:00:00+00	ACTIVE	SookSiam	SookSiam	f	2025-08-03 13:20:31.604+00	2025-06-21 17:29:18.713+00	sooksiam-vegetarian-festival-2019	t	0	0		10:00-22:00	71	\N	SookSiam	none	71	\N	\N	Admin	2023-12-14 00:00:00+00
146	2019-09-28 00:00:00+00	2019-09-28 00:00:00+00	ACTIVE			f	2025-08-03 13:20:32.794+00	2025-06-21 17:29:21.228+00	ny-portuguese-short-film-festival-2019	t	0	0		18:00-20:45	73	\N		none	73	\N	\N	Admin	2023-12-14 00:00:00+00
185	2020-10-03 00:00:00+00	2020-12-27 00:00:00+00	ACTIVE			f	2025-06-25 18:36:58.656+00	2025-06-21 17:30:45.134+00	art-and-play-in-the-park-2	t	0	0		16:30 - 18:30	118	\N		none	118	\N	\N	Admin	2023-07-12 00:00:00+00
178	2020-08-03 00:00:00+00	2020-08-30 00:00:00+00	ACTIVE	ICONCRAFT	ICONCRAFT	f	2025-08-03 13:21:16.566+00	2025-06-21 17:30:30.372+00	iconcraft-thai-textlie-heroes	t	0	0		10:00 - 22:00	110	\N	ICONCRAFT	none	110	\N	\N	Admin	2023-07-12 00:00:00+00
147	2019-09-28 00:00:00+00	2019-10-14 00:00:00+00	ACTIVE			f	2025-08-03 13:20:33.946+00	2025-06-21 17:29:22.799+00	brings-good-things-to-life	t	0	0		10:00-22:00	74	\N		none	74	\N	\N	Admin	2023-12-14 00:00:00+00
375	2025-01-01 12:00:00+00	2025-01-03 12:00:00+00	ACTIVE	\N	\N	f	2025-08-03 10:06:25.625+00	2025-08-03 10:05:00.437+00	prakwdthaayphaaphphluphaayaithawkh-the-iconic-moments-capturing-the-countdown	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
148	2019-10-12 00:00:00+00	2019-10-12 00:00:00+00	ACTIVE	ICONCRAFT	ICONCRAFT	f	2025-08-03 13:20:35.061+00	2025-06-21 17:29:24.485+00	wow-box-workshop-pompom	t	0	0		13:30-15:30	75	\N	ICONCRAFT	none	75	\N	\N	Admin	2023-12-14 00:00:00+00
149	2019-11-14 00:00:00+00	2019-11-17 00:00:00+00	ACTIVE			f	2025-08-03 13:20:36.166+00	2025-06-21 17:29:27.864+00	bricklive-force	t	0	0			78	\N		none	78	\N	\N	Admin	2023-12-14 00:00:00+00
179	2020-08-06 00:00:00+00	2020-08-16 00:00:00+00	ACTIVE			f	2025-08-03 13:21:18.283+00	2025-06-21 17:30:32.374+00	the-elegant-thai-textile	t	0	0		10:00 - 22:00	111	\N		none	111	\N	\N	Admin	2023-07-12 00:00:00+00
151	2019-11-08 00:00:00+00	2019-11-10 00:00:00+00	ACTIVE			f	2025-08-03 13:20:38.598+00	2025-06-21 17:29:32.694+00	the-celebrations-of-glory	t	0	0			82	\N		none	82	\N	\N	Admin	2023-12-14 00:00:00+00
180	2020-08-08 00:00:00+00	2020-08-30 00:00:00+00	ACTIVE			f	2025-08-03 13:21:18.86+00	2025-06-21 17:30:34.486+00	mothers-day-2020	t	0	0			112	\N		none	112	\N	\N	Admin	2023-07-12 00:00:00+00
152	2019-11-11 00:00:00+00	2019-11-11 00:00:00+00	ACTIVE	River Park	River Park	f	2025-08-03 13:20:39.754+00	2025-06-21 17:29:34.316+00	iconsiam-chao-phraya-river-of-glory	t	0	0			83	\N	River Park	none	83	\N	\N	Admin	2023-12-14 00:00:00+00
181	2020-08-24 00:00:00+00	2020-08-30 00:00:00+00	ACTIVE			f	2025-08-03 13:21:20.547+00	2025-06-21 17:30:36.267+00	green-garden-market	t	0	0		10:00 - 22:00	113	\N		none	113	\N	\N	Admin	2023-07-12 00:00:00+00
153	2019-11-01 00:00:00+00	2019-11-28 00:00:00+00	ACTIVE			f	2025-08-03 13:20:41.397+00	2025-06-21 17:29:35.923+00	siam-takashimaya-glory-hokkaido-celebration	t	0	0		10:00 - 22:00	84	\N		none	84	\N	\N	Admin	2023-12-14 00:00:00+00
154	2019-11-08 00:00:00+00	2019-11-11 00:00:00+00	ACTIVE	SookSiam	SookSiam	f	2025-08-03 13:20:43.188+00	2025-06-21 17:29:37.617+00	1-year-anniversary-with-7-happiness	t	0	0		10:00 - 22:00	85	\N	SookSiam	none	85	\N	\N	Admin	2023-12-14 00:00:00+00
182	2020-09-04 00:00:00+00	2020-09-06 00:00:00+00	ACTIVE			f	2025-08-03 13:21:22.249+00	2025-06-21 17:30:38.272+00	international-plakad-competition-2020-iconsiam	t	0	0		10:00-22:00	114	\N		none	114	\N	\N	Admin	2023-07-12 00:00:00+00
156	2019-11-07 00:00:00+00	2019-11-17 00:00:00+00	ACTIVE			f	2025-08-03 13:20:45.356+00	2025-06-21 17:29:41.521+00	siam-takashimaya-hokkaido-flower	t	0	0			87	\N		none	87	\N	\N	Admin	2023-12-14 00:00:00+00
157	2019-11-01 00:00:00+00	2019-11-28 00:00:00+00	ACTIVE			f	2025-08-03 13:20:46.545+00	2025-06-21 17:29:43.176+00	siam-takashimaya-hokkaido-food-festival	t	0	0		10:00 - 22:00	88	\N		none	88	\N	\N	Admin	2023-12-14 00:00:00+00
158	2019-11-01 00:00:00+00	2019-11-28 00:00:00+00	ACTIVE			f	2025-08-03 13:20:47.703+00	2025-06-21 17:29:44.817+00	sapporo-red-brick-food-hall	t	0	0		10:00 - 22:00	89	\N		none	89	\N	\N	Admin	2023-12-14 00:00:00+00
183	2020-09-25 00:00:00+00	2020-11-15 00:00:00+00	ACTIVE			f	2025-08-03 13:21:23.91+00	2025-06-21 17:30:41.351+00	iconsiam-green-on-top	t	0	0		10:00 - 22:00	116	\N		none	116	\N	\N	Admin	2023-07-12 00:00:00+00
155	2019-11-08 00:00:00+00	2019-11-17 00:00:00+00	ACTIVE	River Park	River Park	f	2025-06-25 18:36:10.557+00	2025-06-21 17:29:39.645+00	disneys-mickey-go-thailand	t	0	0			86	\N	River Park	none	86	\N	\N	Admin	2023-12-14 00:00:00+00
159	2019-11-19 00:00:00+00	2020-01-05 00:00:00+00	ACTIVE	River Park	River Park	f	2025-08-03 13:20:49.611+00	2025-06-21 17:29:46.61+00	bangkok-illumination-2019	t	0	0			90	\N	River Park	none	90	\N	\N	Admin	2023-12-14 00:00:00+00
160	2019-11-20 00:00:00+00	2019-11-24 00:00:00+00	ACTIVE	SookSiam	SookSiam	f	2025-08-03 13:20:50.741+00	2025-06-21 17:29:48.623+00	sooksiam-krudam-fight	t	0	0		13.00 – 21.00 น	91	\N	SookSiam	none	91	\N	\N	Admin	2023-12-14 00:00:00+00
162	2019-12-31 00:00:00+00	2019-12-31 00:00:00+00	ACTIVE	River Park	River Park	f	2025-08-03 13:20:53.978+00	2025-06-21 17:29:53.497+00	amazing-thailand-countdown-2020-c28030b0-103a-11ea-a834-9978c72757de	t	0	0		16.30	94	\N	River Park	none	94	\N	\N	Admin	2023-12-14 00:00:00+00
164	2019-12-10 00:00:00+00	2020-01-05 00:00:00+00	ACTIVE			f	2025-08-03 13:20:56.927+00	2025-06-21 17:29:57.299+00	iconsiam-world-of-gifts	t	0	0		10:00 - 22:00	96	\N		none	96	\N	\N	Admin	2023-07-12 00:00:00+00
165	2020-01-09 00:00:00+00	2020-01-12 00:00:00+00	ACTIVE			f	2025-08-03 13:20:58.618+00	2025-06-21 17:29:59.326+00	he-iconic-childrens-playground-at-iconsiam	t	0	0		10:00 - 22:00	97	\N		none	97	\N	\N	Admin	2023-07-12 00:00:00+00
167	2020-01-22 00:00:00+00	2020-01-26 00:00:00+00	ACTIVE			f	2025-08-03 13:21:01.974+00	2025-06-21 17:30:03.489+00	the-iconsiam-eternal-prosperity-chinese-new-year-2020	t	0	0		10:00 - 22:00	99	\N		none	99	\N	\N	Admin	2023-07-12 00:00:00+00
168	2020-01-22 00:00:00+00	2020-01-26 00:00:00+00	ACTIVE	SookSiam	SookSiam	f	2025-08-03 13:21:03.714+00	2025-06-21 17:30:07.259+00	chinese-new-year-festival-at-sooksiam	t	0	0		10.00 - 22.00 	100	\N	SookSiam	none	100	\N	\N	Admin	2023-07-12 00:00:00+00
169	2020-01-27 00:00:00+00	2020-02-12 00:00:00+00	ACTIVE			f	2025-08-03 13:21:05.062+00	2025-06-21 17:30:10.425+00	amazing-thailand-countdown-2020-exhibition	t	0	0		10:00 - 22:00	101	\N		none	101	\N	\N	Admin	2023-07-12 00:00:00+00
207	2022-04-08 00:00:00+00	2022-04-17 00:00:00+00	ACTIVE			f	2025-08-03 13:21:53.216+00	2025-06-21 17:31:38.767+00	the-iconic-songkran-festival-2022	t	0	0		10:00 - 22:00	146	\N		none	146	\N	\N	Admin	2023-07-12 00:00:00+00
368	2022-12-25 12:00:00+00	2039-12-21 12:00:00+00	ACTIVE	\N	\N	f	2025-08-03 13:20:29.897+00	2025-07-12 10:01:20.962+00	iconicduo-mei-ti-deng-guang-shui-ying-biao-yan-mei-tian-zai-xian-luo-tian-di	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
208	2022-04-07 00:00:00+00	2022-04-24 00:00:00+00	ACTIVE	River Park	River Park	f	2025-08-03 13:21:54.847+00	2025-06-21 17:31:40.974+00	iconsiam-summer-kite-playground-7c4b7320-b18c-11ec-b564-95884dc366f2	t	0	0		16.00 - 20.00	147	\N	River Park	none	147	\N	\N	Admin	2023-07-12 00:00:00+00
217	2023-01-07 00:00:00+00	2023-01-31 00:00:00+00	ACTIVE			f	2025-07-09 17:33:51.164+00	2025-06-21 17:32:39.685+00	maris-playground-and-my-sketchbook	t	0	0			181	\N		none	181	\N	\N	Admin	2023-07-12 00:00:00+00
161	2019-11-10 00:00:00+00	2019-11-30 00:00:00+00	ACTIVE			f	2025-08-03 13:20:51.937+00	2025-06-21 17:29:50.421+00	din-puean-mueg	t	0	0		10.00 - 20.00	92	\N		none	92	\N	\N	Admin	2023-12-14 00:00:00+00
184	2020-10-31 00:00:00+00	2020-10-31 00:00:00+00	ACTIVE	River Park	River Park	f	2025-08-03 13:21:24.945+00	2025-06-21 17:30:43.39+00	loy-krathong-festival-2020	t	0	0		16:00 - 24:00	117	\N	River Park	none	117	\N	\N	Admin	2023-07-12 00:00:00+00
383	2025-03-06 12:00:00+00	2025-03-09 12:00:00+00	ACTIVE	\N	\N	f	2025-08-03 11:07:09.371+00	2025-08-03 11:07:09.368+00	the-funtastic-universe	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
209	2022-05-17 00:00:00+00	2022-05-29 00:00:00+00	ACTIVE	SookSiam	SookSiam	f	2025-08-03 13:21:57.366+00	2025-06-21 17:31:44.063+00	sooksiam-amazing-fruit-paradise-2022	t	0	0		10.00-22.00 	149	\N	SookSiam	none	149	\N	\N	Admin	2023-07-12 00:00:00+00
106	2018-12-31 00:00:00+00	2019-01-01 00:00:00+00	ACTIVE			f	2025-08-03 13:19:27.012+00	2025-06-21 17:27:51.161+00	amazing-thailand-countdown-2019	t	0	0			8	\N		none	8	\N	\N	Admin	2023-12-14 00:00:00+00
188	2020-12-02 00:00:00+00	2021-01-05 00:00:00+00	ACTIVE			f	2025-08-03 13:21:28.438+00	2025-06-21 17:30:51.634+00	iconsiam-world-of-gifts-2020	t	0	0		10:00 - 22:00	121	\N		none	121	\N	\N	Admin	2023-07-12 00:00:00+00
210	2022-06-06 00:00:00+00	2022-06-12 00:00:00+00	ACTIVE			f	2025-08-03 13:21:59.546+00	2025-06-21 17:31:47.785+00	iconsiam-green-garden-market	t	0	0		10:00 - 22:00	150	\N		none	150	\N	\N	Admin	2023-07-12 00:00:00+00
190	2020-12-22 00:00:00+00	2021-01-03 00:00:00+00	ACTIVE	SookSiam	SookSiam	f	2025-08-03 13:21:31.192+00	2025-06-21 17:30:56.849+00	sooksiam-sawasdee-happiness-2021	t	0	0			124	\N	SookSiam	none	124	\N	\N	Admin	2023-07-12 00:00:00+00
212	2022-07-19 00:00:00+00	2022-07-27 00:00:00+00	INACTIVE			f	2025-08-03 13:22:00.919+00	2025-06-21 17:31:53.839+00	dino-fun-run	t	0	0		10:00 - 22:00	153	\N		none	153	\N	\N	Admin	2023-07-12 00:00:00+00
191	2021-03-12 00:00:00+00	2021-04-18 00:00:00+00	ACTIVE	River Park	River Park	f	2025-08-03 13:21:32.834+00	2025-06-21 17:30:58.879+00	iconsiam-summer-kite-playground	t	0	0		16:00 - 20:00	125	\N	River Park	none	125	\N	\N	Admin	2023-07-12 00:00:00+00
192	2021-04-02 00:00:00+00	2021-04-06 00:00:00+00	ACTIVE			f	2025-08-03 13:21:33.92+00	2025-06-21 17:31:01.044+00	mango-of-siam	t	0	0		10:00 - 22:00	126	\N		none	126	\N	\N	Admin	2023-07-12 00:00:00+00
193	2021-04-09 00:00:00+00	2021-04-18 00:00:00+00	ACTIVE			f	2025-08-03 13:21:35.452+00	2025-06-21 17:31:02.967+00	xian-luo-tian-di-the-iconic-2021song-gan-jie	t	0	0		10:00 - 22:00	127	\N		none	127	\N	\N	Admin	2023-07-12 00:00:00+00
215	2022-11-08 00:00:00+00	2022-11-08 00:00:00+00	ACTIVE	River Park	River Park	f	2025-08-03 13:22:06.58+00	2025-06-21 17:32:23.747+00	iconsiam-chao-phraya-river-of-eternal-prosperity	t	0	0		15:00 - 24:00	171	\N	River Park	none	171	\N	\N	Admin	2023-07-12 00:00:00+00
195	2021-10-01 00:00:00+00	2021-10-11 00:00:00+00	ACTIVE			f	2025-08-03 13:21:37.157+00	2025-06-21 17:31:09.84+00	green-garden-market-oct-21	t	0	0		11:00 - 20:00	131	\N		none	131	\N	\N	Admin	2023-07-12 00:00:00+00
218	2023-03-07 00:00:00+00	2023-03-26 00:00:00+00	ACTIVE	ICONLUXE	ICONLUXE	f	2025-08-03 13:22:09.923+00	2025-06-21 17:32:49.739+00	romantic-pursuit	t	0	0		11:00 - 21:00	187	\N	ICONLUXE	none	187	\N	\N	Admin	2023-07-12 00:00:00+00
196	2021-10-05 00:00:00+00	2021-10-14 00:00:00+00	ACTIVE			f	2025-08-03 13:21:38.804+00	2025-06-21 17:31:11.942+00	vegetarian-food-festival-2021	t	0	0		10:00 - 21:00	132	\N		none	132	\N	\N	Admin	2023-07-12 00:00:00+00
219	2023-03-31 00:00:00+00	2023-09-03 00:00:00+00	ACTIVE			f	2025-08-03 13:22:11.648+00	2025-06-21 17:32:55.006+00	van-gogh-alive-bangkok	t	0	0		10:30 - 21:30	189	\N		none	189	\N	\N	Admin	2023-08-16 00:00:00+00
197	2021-10-05 00:00:00+00	2021-10-14 00:00:00+00	ACTIVE	SookSiam	SookSiam	f	2025-08-03 13:21:39.879+00	2025-06-21 17:31:14.026+00	sooksiam-vegetarian-food-fest-2021	t	0	0		10:00 - 21:00	133	\N	SookSiam	none	133	\N	\N	Admin	2023-07-12 00:00:00+00
225	2024-01-12 00:00:00+00	2024-01-31 00:00:00+00	ACTIVE	river-park	river-park	f	2025-08-03 13:22:19.45+00	2025-06-21 17:33:29.382+00	iconsiam-the-magic-dragon-2024-by-miguel-chevalier	t	0	0			213	\N	river-park	none	213	\N	\N		2024-01-09 00:00:00+00
376	2024-01-01 12:00:00+00	2024-01-03 12:00:00+00	ACTIVE	\N	\N	f	2025-08-03 13:22:23.555+00	2025-08-03 10:15:43.565+00	prakwdthaayphaaphphluphaayaithawkh-the-unrivaled-phenomenon-of-siam	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
198	2021-10-15 00:00:00+00	2021-10-31 00:00:00+00	ACTIVE			f	2025-08-03 13:21:40.977+00	2025-06-21 17:31:16.223+00	thonburi-is-so-good	t	0	0		10:00 - 21:00	134	\N		none	134	\N	\N	Admin	2023-07-12 00:00:00+00
199	2021-11-02 00:00:00+00	2021-11-02 00:00:00+00	ACTIVE			f	2025-08-03 13:21:41.557+00	2025-06-21 17:31:18.214+00	endless-celebration	t	0	0		10:00 - 22:00	135	\N		none	135	\N	\N	Admin	2023-07-12 00:00:00+00
194	2021-09-16 00:00:00+00	2021-09-30 00:00:00+00	ACTIVE			f	2025-08-03 06:48:26.085+00	2025-06-21 17:31:07.137+00	siam-smile-market-sep-21	t	0	0			130	\N		none	130	\N	\N	Admin	2023-07-12 00:00:00+00
200	2021-12-01 00:00:00+00	2022-01-02 00:00:00+00	ACTIVE			f	2025-08-03 13:21:43.312+00	2025-06-21 17:31:21.401+00	iconsiam-world-of-gifts-let-the-magic-begin	t	0	0		10:00 - 22:00	137	\N		none	137	\N	\N	Admin	2023-07-12 00:00:00+00
201	2021-12-31 00:00:00+00	2021-12-31 00:00:00+00	ACTIVE	River Park	River Park	f	2025-08-03 13:21:44.985+00	2025-06-21 17:31:23.719+00	amazing-thailand-contdown-2022	t	0	0		21:00	138	\N	River Park	none	138	\N	\N	Admin	2023-07-12 00:00:00+00
203	2022-01-04 00:00:00+00	2022-01-17 00:00:00+00	ACTIVE			f	2025-08-03 13:21:47.52+00	2025-06-21 17:31:27.844+00	the-iconic-childrens-festival-2022	t	0	0		10:00 - 22:00	140	\N		none	140	\N	\N	Admin	2023-07-12 00:00:00+00
204	2022-01-27 00:00:00+00	2022-02-02 00:00:00+00	ACTIVE			f	2025-08-03 13:21:49.266+00	2025-06-21 17:31:30.098+00	iconsiam-eternal-prosperity-chinese-new-year-2022	t	0	0		10:00 - 22:00	141	\N		none	141	\N	\N	Admin	2023-07-12 00:00:00+00
206	2022-03-01 00:00:00+00	2022-03-31 00:00:00+00	ACTIVE			f	2025-08-03 13:21:52.004+00	2025-06-21 17:31:35.999+00	icon-aroi-all-i-need-is-buffet	t	0	0		10:00-22:00	144	\N		none	144	\N	\N	Admin	2023-07-12 00:00:00+00
141	2019-09-01 00:00:00+00	2019-09-30 00:00:00+00	ACTIVE	ICONCRAFT	ICONCRAFT	f	2025-08-03 13:20:22.435+00	2025-06-21 17:29:06.804+00	change-pop-up-store-by-cea	t	0	0			61	\N	ICONCRAFT	none	61	\N	\N	Admin	2023-12-14 00:00:00+00
187	2020-11-05 00:00:00+00	2020-12-30 00:00:00+00	ACTIVE			f	2025-08-03 13:21:27.222+00	2025-06-21 17:30:49.718+00	iconsiam-magic-comes-alive-celebrating-with-bangkok-illumination-2020	t	0	0		10:00 - 22:00	120	\N		none	120	\N	\N	Admin	2023-07-12 00:00:00+00
214	2022-11-01 00:00:00+00	2022-12-25 00:00:00+00	ACTIVE			f	2025-08-03 13:22:04.906+00	2025-06-21 17:32:21.276+00	icon-luminaire	t	0	0		14:00 – 20:00	170	\N		none	170	\N	\N	Admin	2023-07-12 00:00:00+00
125	2019-05-11 00:00:00+00	2019-05-12 00:00:00+00	ACTIVE	River Park	River Park	f	2025-08-03 13:19:54.486+00	2025-06-21 17:28:28.313+00	thailand-jazz-competition-2019	t	0	0		16.00	31	\N	River Park	none	31	\N	\N	Admin	2023-12-14 00:00:00+00
205	2022-03-05 00:00:00+00	2022-03-20 00:00:00+00	ACTIVE	ICON Art and Culture Space	ICON Art and Culture Space	f	2025-08-03 13:21:50.846+00	2025-06-21 17:31:32.81+00	thailand-digital-art-festival-2022	t	0	0		10.00 – 21.00 น	142	\N	ICON Art and Culture Space	none	142	\N	\N	Admin	2023-07-12 00:00:00+00
128	2019-06-01 00:00:00+00	2019-06-13 00:00:00+00	ACTIVE	Kids Avenue,ICONCRAFT,ICONACTIVE	Kids Avenue,ICONCRAFT,ICONACTIVE	f	2025-08-03 13:19:58.594+00	2025-06-21 17:28:33.581+00	demark-show-2019	t	0	0		10:00 - 19:00	34	\N	Kids Avenue,ICONCRAFT,ICONACTIVE	none	34	\N	\N	Admin	2023-12-14 00:00:00+00
226	2023-11-27 00:00:00+00	2023-11-27 00:00:00+00	ACTIVE	river-park	river-park	f	2025-08-03 13:22:21.306+00	2025-06-21 17:33:33.261+00	iconsiam-chao-phraya-river-of-eternal-prosperity-2023	t	0	0		15:00 - 24:00	209	\N	river-park	none	209	\N	\N		2023-11-20 00:00:00+00
227	2023-12-29 00:00:00+00	2023-12-31 00:00:00+00	ACTIVE	river-park	river-park	f	2025-08-03 13:22:23.04+00	2025-06-21 17:33:37.487+00	amazing-thailand-countdown-2024	t	0	0			211	\N	river-park	none	211	\N	\N		2024-01-07 00:00:00+00
241	2024-09-27 00:00:00+00	2024-10-27 00:00:00+00	ACTIVE	napalai-terrace	napalai-terrace	f	2025-08-03 13:22:41.442+00	2025-06-21 17:34:59.374+00	iconsiamxi-shou-han-guo-smyu-le-gong-si	t	0	0		11am - 8pm	235	\N	napalai-terrace	none	241	\N	\N		2024-10-01 00:00:00+00
229	2024-02-29 00:00:00+00	2024-03-10 00:00:00+00	ACTIVE	charoennakorn-hall	charoennakorn-hall	f	2025-08-03 13:22:26.382+00	2025-06-21 17:33:51.145+00	iconic-craft-coffee-fest-2024	t	0	0			218	\N	charoennakorn-hall	none	224	\N	\N		2024-02-26 00:00:00+00
233	2024-04-01 00:00:00+00	2024-04-30 00:00:00+00	ACTIVE	iconluxe	iconluxe	f	2025-08-03 13:22:29.836+00	2025-06-21 17:34:11.727+00	shade-of-sunshine-a-summer-nostalgia-exhibition	t	0	0			222	\N	iconluxe	none	228	\N	\N		2024-03-26 00:00:00+00
235	2024-04-19 00:00:00+00	2024-05-31 00:00:00+00	ACTIVE	charoennakorn-hall	charoennakorn-hall	f	2025-08-03 13:22:31.512+00	2025-06-21 17:34:23.471+00	journey-to-magic-at-iconsiam	t	0	0			224	\N	charoennakorn-hall	none	230	\N	\N		2024-04-22 00:00:00+00
236	2024-06-01 00:00:00+00	2024-06-30 00:00:00+00	ACTIVE	suralai-hall	suralai-hall	f	2025-08-03 13:22:32.704+00	2025-06-21 17:34:28.371+00	iconsiam-pride-out-loud	t	0	0			226	\N	suralai-hall	none	232	\N	\N		2024-06-09 00:00:00+00
238	2024-08-30 00:00:00+00	2024-09-08 00:00:00+00	ACTIVE	charoennakorn-hall,thara-hall	charoennakorn-hall,thara-hall	f	2025-08-03 13:22:37.334+00	2025-06-21 17:34:43.61+00	iconic-craft-coffee-expo-2024	t	0	0			231	\N	charoennakorn-hall,thara-hall	none	237	\N	\N		2024-08-28 00:00:00+00
244	2024-12-29 00:00:00+00	2024-12-31 00:00:00+00	ACTIVE	river-park	river-park	f	2025-08-03 13:22:45.871+00	2025-06-21 17:35:18.07+00	jie-kai-amazing-thailand-countdown-2025-de-sheng-da-xu-mu	t	0	0			239	\N	river-park	none	245	\N	\N		2025-02-05 00:00:00+00
377	2023-01-01 12:00:00+00	2023-01-05 12:00:00+00	ACTIVE	\N	\N	f	2025-08-03 10:24:01.178+00	2025-08-03 10:24:01.159+00	prakwdphaaphthaaykaaraesdngphlu-cchaakngaan-amazing-thailand-countdown-2023-ainhawkh-amazing-shot-of-happiness	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
245	2025-01-22 00:00:00+00	2025-04-16 00:00:00+00	ACTIVE	1695193888	1695193888	f	2025-08-03 13:22:48.703+00	2025-06-21 17:35:28.286+00	dinolab-jurassic-domination	t	0	0			243	\N	1695193888	none	249	\N	\N		2025-01-22 00:00:00+00
384	2025-03-21 12:00:00+00	2025-04-03 12:00:00+00	ACTIVE	Zone : River Park	\N	f	2025-08-03 13:22:50.454+00	2025-08-03 11:10:50.394+00	iconsiam-summer-kite-playground-2025	t	\N	\N	\N	15:00-21:00	\N	\N	\N	\N	\N	\N	\N	\N	\N
369	2025-06-07 12:00:00+00	2025-08-03 12:00:00+00	ACTIVE	\N	\N	f	2025-08-03 13:22:54.603+00	2025-07-13 05:49:11.7+00	lost-in-domland	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
243	2024-11-01 00:00:00+00	2024-12-25 00:00:00+00	ACTIVE	river-park	river-park	f	2025-08-03 13:28:02.678+00	2025-06-21 17:35:10.155+00	iconsiam-bangkok-illumination-2024-x-robbi	t	0	0			238	\N	river-park	none	244	\N	\N		2024-11-21 00:00:00+00
240	2024-09-15 12:00:00+00	2024-10-15 00:00:00+00	ACTIVE	icon-art-and-culture-space	icon-art-and-culture-space	f	2025-08-03 13:29:42.445+00	2025-06-21 17:34:56.122+00	seventeen-man-gu-zhan-lan-follow-fellow-qiang-shi-lai-xi	t	0	0			234	\N	icon-art-and-culture-space	none	240	\N	\N		2024-09-04 00:00:00+00
242	2024-11-15 00:00:00+00	2024-11-15 00:00:00+00	ACTIVE	river-park	river-park	f	2025-08-03 13:30:37.427+00	2025-06-21 17:35:07.011+00	iconsiamre-lie-huan-ying-da-jia-can-jia-nian-zhong-sheng-hui	t	0	0			237	\N	river-park	none	243	\N	\N		2024-11-05 00:00:00+00
239	2024-09-07 00:00:00+00	2025-01-05 00:00:00+00	ACTIVE	1695193888	1695193888	f	2025-08-03 13:46:25.114+00	2025-06-21 17:34:48.825+00	modern-guru-and-the-path-to-artificial-happiness	t	0	0			232	\N	1695193888	none	238	\N	\N		2024-09-05 00:00:00+00
186	2020-10-16 00:00:00+00	2020-10-25 00:00:00+00	ACTIVE	SookSiam	SookSiam	f	2025-08-03 13:21:26.143+00	2025-06-21 17:30:47.904+00	sooksiam-vegetarian-festival-2020	t	0	0		10:00 - 22:00	119	\N	SookSiam	none	119	\N	\N	Admin	2023-07-12 00:00:00+00
213	2022-11-01 00:00:00+00	2023-01-05 00:00:00+00	ACTIVE			f	2025-08-03 13:22:03.174+00	2025-06-21 17:32:17.085+00	iconsiam-bangkok-illumination-2022	t	0	0			168	\N		none	168	\N	\N	Admin	2023-07-12 00:00:00+00
170	2020-02-08 00:00:00+00	2020-02-23 00:00:00+00	ACTIVE			f	2025-08-03 13:21:06.247+00	2025-06-21 17:30:12.918+00	the-icon-of-love	t	0	0			102	\N		none	102	\N	\N	Admin	2023-07-12 00:00:00+00
202	2022-01-01 00:00:00+00	2022-01-07 00:00:00+00	ACTIVE			t	2025-08-03 13:21:46.309+00	2025-06-21 17:31:25.653+00	kaarprakwdthaayphaaphphlu-amazing-thailand-countdown-2022	t	0	0			139	\N		none	139	\N	\N	Admin	2023-07-12 00:00:00+00
385	2025-05-01 12:00:00+00	2025-05-15 12:00:00+00	ACTIVE	\N	\N	f	2025-08-03 11:17:35.301+00	2025-08-03 11:17:35.286+00	pet-uniwow-the-feather-fur	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
378	2024-11-28 12:00:00+00	2025-01-05 12:00:00+00	ACTIVE	\N	\N	f	2025-08-03 11:20:44.12+00	2025-08-03 10:30:18.213+00	iconsiam-miracle-of-gifts-2024	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
386	2025-06-01 12:00:00+00	2025-06-30 12:00:00+00	ACTIVE	\N	\N	f	2025-08-03 13:22:52.943+00	2025-08-03 11:25:38.523+00	iconsiam-pride-out-louder	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
234	2024-04-10 00:00:00+00	2024-04-21 12:00:00+00	ACTIVE	river-park,charoennakorn-hall	river-park,charoennakorn-hall	f	2025-08-03 13:34:00.56+00	2025-06-21 17:34:18.119+00	xian-luo-tian-di-iconsiamshen-qi-mei-nan-he-2024po-shui-jie	t	0	0			223	\N	river-park,charoennakorn-hall	none	229	\N	\N		2024-04-10 00:00:00+00
216	2022-12-31 00:00:00+00	2022-12-31 00:00:00+00	ACTIVE	River Park	River Park	f	2025-08-03 13:22:07.858+00	2025-06-21 17:32:31.597+00	amazing-thailand-conutdown-2023	t	0	0			176	\N	River Park	none	176	\N	\N	Admin	2023-07-12 00:00:00+00
166	2020-01-07 00:00:00+00	2020-01-15 00:00:00+00	ACTIVE	SookSiam	SookSiam	f	2025-08-03 13:21:00.317+00	2025-06-21 17:30:01.476+00	kids-sanook-sooksiam	t	0	0		10.00-22.00	98	\N	SookSiam	none	98	\N	\N	Admin	2023-07-12 00:00:00+00
189	2020-12-31 00:00:00+00	2020-12-31 00:00:00+00	ACTIVE			f	2025-08-03 13:21:30.069+00	2025-06-21 17:30:53.263+00	amazing-thailand-countdown-2021	t	0	0		17:00	122	\N		none	122	\N	\N	Admin	2023-07-12 00:00:00+00
379	2023-01-18 12:00:00+00	2023-01-24 12:00:00+00	ACTIVE	\N	\N	f	2025-08-03 13:22:08.695+00	2025-08-03 10:45:46.342+00	the-iconsiam-eternal-prosperity-chinese-new-year-2023	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
121	2019-03-15 00:00:00+00	2019-03-17 00:00:00+00	ACTIVE	River Park	River Park	f	2025-08-03 13:19:49.32+00	2025-06-21 17:28:21.236+00	iconsiam-fashion-trend-2019	t	0	0		17:30	27	\N	River Park	none	27	\N	\N	Admin	2023-12-14 00:00:00+00
131	2019-06-10 00:00:00+00	2019-07-31 00:00:00+00	ACTIVE	ICONLUXE	ICONLUXE	f	2025-08-03 13:20:02.405+00	2025-06-21 17:28:39.394+00	memoirs-of-thai-loyal-unity-under-hmk-graciousnessexhibition	t	0	0		10:00 - 22:00	38	\N	ICONLUXE	none	38	\N	\N	Admin	2023-12-14 00:00:00+00
220	2023-03-31 00:00:00+00	2023-04-10 00:00:00+00	ACTIVE	River Park	River Park	f	2025-08-03 13:22:13.37+00	2025-06-21 17:32:58.19+00	summer-kite-playground-2023	t	0	0		16:00 - 22:00	190	\N	River Park	none	190	\N	\N	Admin	2023-07-12 00:00:00+00
232	2024-03-26 00:00:00+00	2024-04-08 00:00:00+00	ACTIVE	river-park	river-park	f	2025-08-03 13:38:26.431+00	2025-06-21 17:34:05.659+00	iconsiam-2024nian-du-xia-ri-feng-zheng-you-le-chang	t	1	0			221	\N	river-park	none	227	\N	\N		2024-03-27 00:00:00+00
222	2023-08-03 00:00:00+00	2023-09-03 00:00:00+00	ACTIVE			f	2025-08-03 13:22:16.443+00	2025-06-21 17:33:12.987+00	bts-exhibition-proof	t	0	0		10:30 - 22:00	199	\N		none	199	\N	\N		2023-08-04 00:00:00+00
230	2024-03-15 00:00:00+00	2024-07-31 00:00:00+00	ACTIVE	1695193888	1695193888	f	2025-08-03 13:22:27.47+00	2025-06-21 17:33:55.046+00	davinci-alive-bangkok	t	1	0		10:30 - 21:00	219	\N	1695193888	none	225	\N	\N		2024-03-25 00:00:00+00
237	2024-08-23 00:00:00+00	2025-01-05 00:00:00+00	ACTIVE	1695193888	1695193888	f	2025-08-03 13:22:34.454+00	2025-06-21 17:34:37.13+00	the-conjuring-universe-tour	t	0	0		11.00 - 20.00	229	\N	1695193888	none	235	\N	\N		2024-08-08 00:00:00+00
99	1970-01-01 00:00:00+00	1970-01-01 00:00:00+00	INACTIVE			f	2025-08-03 13:19:16.83+00	2025-06-21 17:27:38.71+00	citizen-of-love	t	0	0			1	\N		none	1	\N	\N	Admin	2023-12-14 00:00:00+00
100	2018-12-08 00:00:00+00	2019-01-20 00:00:00+00	ACTIVE	ICONLUXE	ICONLUXE	f	2025-08-03 13:19:18.313+00	2025-06-21 17:27:40.565+00	lady-dior-as-seen-by	t	0	0		11:00-20:00	2	\N	ICONLUXE	none	2	\N	\N	Admin	2023-12-14 00:00:00+00
102	2018-11-14 00:00:00+00	2019-02-14 00:00:00+00	ACTIVE			f	2025-08-03 13:19:21.512+00	2025-06-21 17:27:44.976+00	event-02	t	0	0		11:00-22:00	4	\N		none	4	\N	\N	Admin	2023-12-14 00:00:00+00
380	2025-01-24 12:00:00+00	2025-02-25 12:00:00+00	ACTIVE	\N	\N	f	2025-08-03 13:22:46.475+00	2025-08-03 10:52:27.224+00	iconsiam-a-prosperous-chinese-new-year-2025	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
163	2019-12-11 00:00:00+00	2020-01-05 00:00:00+00	ACTIVE			f	2025-08-03 13:20:55.278+00	2025-06-21 17:29:55.407+00	world-press-photo-exhibition	t	0	0		10.00 am - 07.0	95	\N		none	95	\N	\N	Admin	2023-07-12 00:00:00+00
228	2024-02-07 00:00:00+00	2024-02-11 00:00:00+00	ACTIVE	river-park,charoennakorn-hall,rassada-hall,sooksiam	river-park,charoennakorn-hall,rassada-hall,sooksiam	f	2025-08-03 13:22:25.289+00	2025-06-21 17:33:45.327+00	the-iconsiam-eternal-prosperity-chinese-new-year-2024	t	0	0			216	\N	river-park,charoennakorn-hall,rassada-hall,sooksiam	none	216	\N	\N		2024-02-09 00:00:00+00
119	2019-02-08 00:00:00+00	2019-02-10 00:00:00+00	ACTIVE			f	2025-08-03 13:19:45.382+00	2025-06-21 17:28:14.05+00	aia-vitality-fest	t	0	0			21	\N		none	21	\N	\N	Admin	2023-12-14 00:00:00+00
350	2025-04-10 12:00:00+00	2025-04-16 12:00:00+00	ACTIVE	river-park	river-park	t	2025-08-03 13:22:52.183+00	2025-06-25 18:15:41.871+00	iconsiamtai-guo-biao-zhi-xing-song-gan-jie-qing-dian-2025	t	0	0			3	\N	river-park	none	254	\N	\N		2025-04-04 00:00:00+00
387	2025-06-06 12:00:00+00	2025-06-06 12:00:00+00	ACTIVE	\N	\N	f	2025-08-03 13:22:53.49+00	2025-08-03 11:30:38.843+00	iconsiam-x-kiihmuuenfaa-exclusive-fan-meet	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
352	2025-05-01 00:00:00+00	2025-07-20 12:00:00+00	ACTIVE	1695096601,1695193888	1695096601,1695193888	t	2025-07-11 07:16:17.999+00	2025-06-25 18:15:53.619+00	100-doraemon--friends-tour	t	0	0			3	\N	1695096601,1695193888	none	256	\N	\N		2025-05-06 00:00:00+00
223	2023-09-22 00:00:00+00	2024-02-14 00:00:00+00	ACTIVE	1695193888	1695193888	f	2025-07-09 17:33:48.508+00	2025-06-21 17:33:21.428+00	monet-and-friends-alive-bangkok	t	1	0		10:30 - 21:00	204	\N	1695193888	none	204	\N	\N		2024-01-07 00:00:00+00
\.


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.events_id_seq', 390, true);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: events_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_created_at_idx ON public.events USING btree (created_at);


--
-- Name: events_location_location_floor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_location_location_floor_idx ON public.events USING btree (location_floor_id);


--
-- Name: events_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_slug_idx ON public.events USING btree (slug);


--
-- Name: events_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_updated_at_idx ON public.events USING btree (updated_at);


--
-- Name: events events_location_floor_id_floors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_location_floor_id_floors_id_fk FOREIGN KEY (location_floor_id) REFERENCES public.floors(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

