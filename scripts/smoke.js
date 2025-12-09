(async ()=>{
  try {
    const base = 'http://localhost:5000/api';
    const proR = await fetch(`${base}/projects`);
    const proJ = await proR.json();
    console.log('projects count:', Array.isArray(proJ.data) ? proJ.data.length : 'no data');
    const id = proJ.data && proJ.data[0] && proJ.data[0]._id;
    if (!id) return console.error('No project id found');
    console.log('checking project id', id);
    const one = await fetch(`${base}/projects/${id}`);
    const oneJ = await one.json();
    console.log('project title:', oneJ.data?.title || '(no title)');
    const view = await fetch(`${base}/projects/${id}/view`, { method: 'POST' });
    const viewJ = await view.json();
    console.log('/view response:', viewJ);
  } catch (e) {
    console.error('error', e);
  }
})();
