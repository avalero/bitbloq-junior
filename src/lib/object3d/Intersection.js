import * as Three from 'three';

import CompoundObject from './CompoundObject';
import { ThreeBSP } from './threeCSG';

export default class Intersection extends CompoundObject {
  getGeometry() {
    // First element of array
    let intersectionMeshBSP = new ThreeBSP(this.children[0].getMess());
    // Intersect with the rest
    for (let i = 1; i < this.children.length; i += 1) {
      const bspMesh = new ThreeBSP(this.children[i].getMesh());
      intersectionMeshBSP = intersectionMeshBSP.intersect(bspMesh);
    }
    return intersectionMeshBSP.toMesh(new Three.MeshLambertMaterial({color: 0xff0000}));
  }
}
