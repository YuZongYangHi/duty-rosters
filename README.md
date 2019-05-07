## 基于Django Rest Framework开发的值班表设计

#### 能够做什么?

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
 - 框架: React
 - UI: Ant Design
 - request: axios
 
 前端采用JavaScript框架React进行开发, 及搭配蚂蚁金服开源的一套UI框架Ant Design
```
 
 
 ##### 后端:
 ```text
 - 语言: Python3.6
 - 框架: Django Rest Framework 
 - db: mysql5.7
 - other: celery
 
 语言用的Python, 版本为3.6+, 低版本并不能保证是否支持, 框架为Django2.0.1+, Rest风格, 数据库支持为MySQL5.7, celery为我们定时发送邮件当天值班人员是谁
 ```
 
 #### 设计思路
 ```text
起初涉及的时候想的不是很多, 后来公司的同事给了思路, 所以就按照了这种思路去做, 效果非常的好, 我们起初只设计3个表, 这三个表的对应关系如下:
   
    - duty_staff: 每一个值班人员的信息, 包括邮箱、手机等等，新增的值班人员必须记录到这个里面
    - history_duty: 存的是当天及当天以前的值班人员记录及对应的日期，当天以后全部是推算
    - draw_order: 根据这个表里面的日期今天推算值班顺序及重新抽签的时间及时间间隔等等

我们的涉及思路是, 算法推算的时候，数据录入只录入当天即当天以前的值班数据，其余时间全部是推算出来，这样也方便我们临时抽签变化人员时作准备, 我们也可设计多次抽签进行预留，并且进行抽签间隔等等，可进行自动抽签不自动抽签
```
 
 
 #### 安装
 ```bash
# 快速部署起来测试， 你只需要执行几个步骤

1. 你需要拥有python3.6的版本, 及一个干净的虚拟环境

# 安装相关依赖包

cd onduty_api

pip install -r requirements.txt

python manage.py makemigrations && python manage.py makemigrate 

python manage.py runserver 0.0.0.0:8000

# 前端
cd onduty_ui

yarn install 

yarn start 

```
 