import { request } from 'umi';

export async function fetchOnCallUserList(params: any) {
  return request('/api/v1/oncall/list', {
    method: 'GET',
    params: params,
    })
}

export async function updateOncall(data: any) {
  return request('/api/v1/oncall/update', {
    method: 'POST',
    data: data,
  })
}


export async function fetchUserList() {
  return request('/api/v1/oncall/users', {
    method: 'GET',
  })
}

export async function fetchDrawLotsList() {
  return request('/api/v1/oncall/draw_lots_list', {
    method: 'GET',
  })
}

export async function delDrawLotsList(data) {
  return request('/api/v1/oncall/del_oncall_draw_lots', {
    method: 'POST',
    data: data
  })
}

export async function addDrawLotsList(data) {
  return request('/api/v1/oncall/draw_lots', {
    method: 'POST',
    data: data
  })
}
