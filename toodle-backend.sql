create database toodle_test;
use toodle_test;

create table users (userId bigint,roleId int not null,email varchar(50) not null UNIQUE,firstName varchar(50), lastName varchar(50),registeredAt timestamp DEFAULT CURRENT_TIMESTAMP,passwordHash varchar(50) not null, PRIMARY KEY (userId));
create table assignment(assignment_id varchar(30),createdBy bigint not null, title varchar(50) not null,created_at timestamp DEFAULT CURRENT_TIMESTAMP,publish_time timestamp not null,deadline timestamp not null,description varchar(1000),PRIMARY KEY(assignment_id));
create table assignment_submission(assignment_id varchar(30), userId bigint,submission varchar(1000),status boolean default 0,score int,submission_ts datetime,PRIMARY KEY(assignment_id, userId));
create table user_roles (role_id int auto_increment,title varchar(20) not null,description varchar(100), PRIMARY KEY (role_id));
insert into user_roles values(1,'Teacher','I am a Teacher');
insert into user_roles values(2,'Student','I am a Student');

#select * from users;
#select GROUP_CONCAT(userId) as ids from users where userId in ('1673678892033','1673690251204') and roleId = 2;
#select userId,1234 as assignmentId from users;
#create table user_roles (role_id int auto_increment,title varchar(20) not null,description varchar(100), PRIMARY KEY (role_id));
#Select * from user_roles;
#insert into user_roles values(1,'Teacher','I am a Teacher')
#insert into user_roles values(2,'Student','I am a Student')
#create table access_management (role_id varchar(20),module_id varchar(20),create_ boolean not null default 0, update_ boolean not null default 0,read_ boolean not null default 0,delete_ boolean not null default 0,PRIMARY KEY(role_id, module_id));
#insert into access_management(1,'assignments',)
#select * from access_management;
#create table assignment(assignment_id varchar(30),createdBy bigint not null, title varchar(50) not null,created_at timestamp DEFAULT CURRENT_TIMESTAMP,publish_time timestamp not null,deadline timestamp not null,description varchar(1000),PRIMARY KEY(assignment_id));
#drop table assignment;
#select * from assignment;
#insert into assignment_submission (assignment_id,userId) select 'assi+gnment_1673698673392' as assignmentId,userId from users where userId in ('1673690251204','16736902534235') and roleId = 2  on DUPLICATE KEY UPDATE assignment_id  = assignment_id;
#create table assignment_submission(assignment_id varchar(30), userId bigint,submission varchar(1000),status boolean default 0,score int,submission_ts datetime,PRIMARY KEY(assignment_id, userId));
#select * from assignment_submission;
#drop table assignment_submission;
#insert into assignment_submission (assignment_id,userId) select 1234 as assignmentId,userId from users where userId in ('1673678892033','1673690251204') and roleId = 2;
#select * from assignment where createdBy = '1673678892033'  and (publish_time<= '2023-01-14T14:27:47.879Z' and deadline> '2023-01-14T14:27:47.879Z' limit 100 offset 0
#select * from assignment a left join assignment_submission b on(a.assignment_id=b.assignment_id) where b.userId = '1673690251204'  and a.publish_time>= '2023-01-14T15:06:48.881Z'   and (b.status = 0 and a.deadline < '2023-01-14T15:06:48.881Z')  limit 100 offset 0
#select a.description,b.userId,b.status,b.score,b.submission_ts from assignment a left join assignment_submission b on(a.assignment_id=b.assignment_id) where b.userId = '1673690251204' and b.assignment_id = 'assignment_1673708230649'