## 基于Python语言开发的值班表设计

### example
#### 一、可以对未来的任意时间进行人员换班
![image](docs/img/2756a1df-eb2b-49de-b3df-2871b46ce910.gif)   

#### 二、可以创建排班时间，包括一键打乱
![image](docs/img/c1e06024-7863-4e7f-99f4-64010ce0d414.gif)
#### 三、增删用户，新增的用户之后，可以基于排班表动态延伸
![image](docs/img/f12d9616-e1d1-4a03-a30d-38de255a8f05.gif)

#### 能够做什么?
- 完美的前后端分离，平台化展示值班表， 可以增删用户、抽签、换班
- 记录每天值班人员是谁，可进行邮件或接入微信, 企业微信, 玎钉进行每日值班人员提示
- 可接入接入任何平台, 例如Jira, 进行相关值班人员处理工单
- 动态推算, 不需要每周进行手动排班然后发送邮件通知
- 历史记录，未来推算值班人员进行清晰明了查询值班人员

#### 功能： 
1. 支持不同之间人员换班
2. 支持手动抽签进行重新轮班
3. 支持自动抽签进行重新轮班
4. 当前以前的数据都是遗留在数据库里, 当天以后的数据全部是推算得出
 
 
 #### 技术涉及:
 `项目采用前后端分离式开发, 如果你目前有前端，那么大可不用项目的前端, 该项目前端，只是把目前的一些功能展示出来，后端api比较易扩展`
 
 ##### 前端:
 ```text
 - 框架: Antd Pro v5
 - 语言：node v16.13.1
```
 
 
 ##### 后端:
 ```text
 - 语言: Python3.7
 - 框架: Djangp3.2
 
 ```
 
 #### 设计思路
 ```text
起初涉及的时候想的不是很多, 后来公司的同事给了思路, 所以就按照了这种思路去做, 效果非常的好, 我们起初只设计3个表, 这三个表的对应关系如下:
   
    - users: 每一个值班人员的信息, 包括邮箱、手机等等，新增的值班人员必须记录到这个里面
    - on_call_schedule: 存的是当天及当天以前的值班人员记录及对应的日期，当天以后全部是推算
    - draw_lots: 根据这个表里面的日期今天推算值班顺序及重新抽签的时间及时间间隔等等

我们的涉及思路是, 算法推算的时候，数据录入只录入当天即当天以前的值班数据，其余时间全部是推算出来，这样也方便我们临时抽签变化人员时作准备, 我们也可设计多次抽签进行预留，并且进行抽签间隔等等，可进行自动抽签不自动抽签
```
 
 
 #### 安装
 ```bash
# 快速部署起来测试， 你只需要执行几个步骤

1. 你需要拥有python3.6的版本, 及一个干净的虚拟环境
2. 如果还需要前端展示,那么请提前下载好对应的前端框架,node版本,npm

# 安装相关依赖包

cd oncall_table_api

pip install -r requirements.txt

python manage.py makemigrations && python manage.py makemigrate 

python manage.py runserver 0.0.0.0:8000

# 前端
cd oncall_table_fe 

yarn install 

yarn start 
```
