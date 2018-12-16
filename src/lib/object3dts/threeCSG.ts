/**
 * Copyright (c) 2018 Bitbloq (BQ)
 *
 * License: MIT
 *
 * long description for the file
 *
 * @summary short description for the file
 * @author David García <https://github.com/empoalp>, Alberto Valero <https://github.com/avalero>
 *
 * Created at     : 2018-10-11 15:03:15
 * Last modified  : 2018-11-28 11:30:07
 */

import * as THREE from "three";

const EPSILON: number = 1e-5,
  COPLANAR: number = 0,
  FRONT: number = 1,
  BACK: number = 2,
  SPANNING: number = 3;

export default class ThreeBSP {
  private Polygon: object;
  private Vertex: object;
  private Node: object;
  private matrix: THREE.Matrix4;
  private tree: Node;

  constructor(object: THREE.Geometry | THREE.Mesh | Node) {
    // Convert THREE.Geometry to ThreeBSP
    let i: number;
    let _length_i: number;
    let face: any;
    let vertex;
    let faceVertexUvs;
    let uvs;
    let polygon: Polygon;
    let polygons: Array<Polygon> = [];
    let tree: Node;
    let geometry: THREE.Geometry;

    this.Polygon = Polygon;
    this.Vertex = Vertex;
    this.Node = Node;
    if (object instanceof THREE.Geometry) {
      this.matrix = new THREE.Matrix4();
      geometry = object;
    } else if (object instanceof THREE.Mesh) {
      // #todo: add hierarchy support
      object.updateMatrix();
      this.matrix = object.matrix.clone();
      geometry = (object as THREE.Mesh).geometry as THREE.Geometry;
    } else if (object instanceof Node) {
      this.tree = object as Node;
      this.matrix = new THREE.Matrix4();
      return this;
    } else {
      throw "ThreeBSP: Given geometry is unsupported";
    }

    for (i = 0, _length_i = geometry.faces.length; i < _length_i; i++) {
      face = geometry.faces[i];
      faceVertexUvs = geometry.faceVertexUvs[0][i];
      polygon = new Polygon();

      if (face instanceof THREE.Face3) {
        vertex = geometry.vertices[face.a];
        uvs = faceVertexUvs
          ? new THREE.Vector2(faceVertexUvs[0].x, faceVertexUvs[0].y)
          : null;
        vertex = new Vertex(
          vertex.x,
          vertex.y,
          vertex.z,
          face.vertexNormals[0],
          uvs as THREE.Vector2
        );
        vertex.applyMatrix4(this.matrix);
        polygon.vertices.push(vertex);

        vertex = geometry.vertices[face.b];
        uvs = faceVertexUvs
          ? new THREE.Vector2(faceVertexUvs[1].x, faceVertexUvs[1].y)
          : null;
        vertex = new Vertex(
          vertex.x,
          vertex.y,
          vertex.z,
          face.vertexNormals[1],
          uvs as THREE.Vector2
        );
        vertex.applyMatrix4(this.matrix);
        polygon.vertices.push(vertex);

        vertex = geometry.vertices[face.c];
        uvs = faceVertexUvs
          ? new THREE.Vector2(faceVertexUvs[2].x, faceVertexUvs[2].y)
          : null;
        vertex = new Vertex(
          vertex.x,
          vertex.y,
          vertex.z,
          face.vertexNormals[2],
          uvs as THREE.Vector2
        );
        vertex.applyMatrix4(this.matrix);
        polygon.vertices.push(vertex);
      } else if (typeof THREE.Face4) {
        vertex = geometry.vertices[face.a];
        uvs = faceVertexUvs
          ? new THREE.Vector2(faceVertexUvs[0].x, faceVertexUvs[0].y)
          : null;
        vertex = new Vertex(
          vertex.x,
          vertex.y,
          vertex.z,
          face.vertexNormals[0],
          uvs as THREE.Vector2
        );
        vertex.applyMatrix4(this.matrix);
        polygon.vertices.push(vertex);

        vertex = geometry.vertices[face.b];
        uvs = faceVertexUvs
          ? new THREE.Vector2(faceVertexUvs[1].x, faceVertexUvs[1].y)
          : null;
        vertex = new Vertex(
          vertex.x,
          vertex.y,
          vertex.z,
          face.vertexNormals[1],
          uvs as THREE.Vector2
        );
        vertex.applyMatrix4(this.matrix);
        polygon.vertices.push(vertex);

        vertex = geometry.vertices[face.c];
        uvs = faceVertexUvs
          ? new THREE.Vector2(faceVertexUvs[2].x, faceVertexUvs[2].y)
          : null;
        vertex = new Vertex(
          vertex.x,
          vertex.y,
          vertex.z,
          face.vertexNormals[2],
          uvs as THREE.Vector2
        );
        vertex.applyMatrix4(this.matrix);
        polygon.vertices.push(vertex);

        vertex = geometry.vertices[face.d];
        uvs = faceVertexUvs
          ? new THREE.Vector2(faceVertexUvs[3].x, faceVertexUvs[3].y)
          : null;
        vertex = new Vertex(
          vertex.x,
          vertex.y,
          vertex.z,
          face.vertexNormals[3],
          uvs as THREE.Vector2
        );
        vertex.applyMatrix4(this.matrix);
        polygon.vertices.push(vertex);
      } else {
        throw `Invalid face type at index ${i}`;
      }

      polygon.calculateProperties();
      polygons.push(polygon);
    }

    this.tree = new Node(polygons);
  }

  subtract(other_tree: ThreeBSP) {
    let a: any = this.tree.clone(),
      b = other_tree.tree.clone();

    a.invert();
    a.clipTo(b);
    b.clipTo(a);
    b.invert();
    b.clipTo(a);
    b.invert();
    a.build(b.allPolygons());
    a.invert();
    a = new ThreeBSP(a);
    a.matrix = this.matrix;
    return a;
  }

  union(other_tree: ThreeBSP) {
    let a: any = this.tree.clone(),
      b = other_tree.tree.clone();

    a.clipTo(b);
    b.clipTo(a);
    b.invert();
    b.clipTo(a);
    b.invert();
    a.build(b.allPolygons());
    a = new ThreeBSP(a);
    a.matrix = this.matrix;
    return a;
  }

  intersect(other_tree: ThreeBSP) {
    let a: any = this.tree.clone(),
      b = other_tree.tree.clone();

    a.invert();
    b.clipTo(a);
    b.invert();
    a.clipTo(b);
    b.clipTo(a);
    a.build(b.allPolygons());
    a.invert();
    a = new ThreeBSP(a);
    a.matrix = this.matrix;
    return a;
  }

  toGeometry() {
    let i,
      j,
      matrix = new THREE.Matrix4().getInverse(this.matrix),
      geometry = new THREE.Geometry(),
      polygons = this.tree.allPolygons(),
      polygon_count = polygons.length,
      polygon,
      polygon_vertice_count,
      vertice_dict = {},
      vertex_idx_a,
      vertex_idx_b,
      vertex_idx_c,
      vertex,
      face,
      verticeUvs;

    for (i = 0; i < polygon_count; i++) {
      polygon = polygons[i];
      polygon_vertice_count = polygon.vertices.length;

      for (j = 2; j < polygon_vertice_count; j++) {
        verticeUvs = [];

        vertex = polygon.vertices[0];
        verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
        vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
        vertex.applyMatrix4(matrix);

        if (
          typeof vertice_dict[`${vertex.x},${vertex.y},${vertex.z}`] !==
          "undefined"
        ) {
          vertex_idx_a = vertice_dict[`${vertex.x},${vertex.y},${vertex.z}`];
        } else {
          geometry.vertices.push(vertex);
          vertex_idx_a = vertice_dict[`${vertex.x},${vertex.y},${vertex.z}`] =
            geometry.vertices.length - 1;
        }

        vertex = polygon.vertices[j - 1];
        verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
        vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
        vertex.applyMatrix4(matrix);
        if (
          typeof vertice_dict[`${vertex.x},${vertex.y},${vertex.z}`] !==
          "undefined"
        ) {
          vertex_idx_b = vertice_dict[`${vertex.x},${vertex.y},${vertex.z}`];
        } else {
          geometry.vertices.push(vertex);
          vertex_idx_b = vertice_dict[`${vertex.x},${vertex.y},${vertex.z}`] =
            geometry.vertices.length - 1;
        }

        vertex = polygon.vertices[j];
        verticeUvs.push(new THREE.Vector2(vertex.uv.x, vertex.uv.y));
        vertex = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
        vertex.applyMatrix4(matrix);
        if (
          typeof vertice_dict[`${vertex.x},${vertex.y},${vertex.z}`] !==
          "undefined"
        ) {
          vertex_idx_c = vertice_dict[`${vertex.x},${vertex.y},${vertex.z}`];
        } else {
          geometry.vertices.push(vertex);
          vertex_idx_c = vertice_dict[`${vertex.x},${vertex.y},${vertex.z}`] =
            geometry.vertices.length - 1;
        }

        face = new THREE.Face3(
          vertex_idx_a,
          vertex_idx_b,
          vertex_idx_c,
          new THREE.Vector3(
            polygon.normal.x,
            polygon.normal.y,
            polygon.normal.z
          )
        );

        geometry.faces.push(face);
        geometry.faceVertexUvs[0].push(verticeUvs);
      }
    }
    return geometry;
  }

  toMesh(material: THREE.MeshBasicMaterial) {
    let geometry = this.toGeometry(),
      mesh = new THREE.Mesh(geometry, material);

    mesh.position.setFromMatrixPosition(this.matrix);
    mesh.rotation.setFromRotationMatrix(this.matrix);

    return mesh;
  }
}
class Polygon {
  public vertices: Array<Vertex>;
  public normal: any;
  public w: any;

  constructor(
    vertices: Array<Vertex> = [],
    normal: any = undefined,
    w: any = undefined
  ) {
    if (!(vertices instanceof Array)) {
      vertices = [];
    }

    this.vertices = vertices;
    if (vertices.length > 0) {
      this.calculateProperties();
    } else {
      this.normal = this.w = undefined;
    }
  }

  calculateProperties() {
    let a = this.vertices[0],
      b = this.vertices[1],
      c = this.vertices[2];

    this.normal = b
      .clone()
      .subtract(a)
      .cross(c.clone().subtract(a))
      .normalize();

    this.w = this.normal.clone().dot(a);

    return this;
  }

  clone() {
    let i,
      vertice_count,
      polygon = new Polygon();

    for (i = 0, vertice_count = this.vertices.length; i < vertice_count; i++) {
      polygon.vertices.push(this.vertices[i].clone());
    }
    polygon.calculateProperties();

    return polygon;
  }

  flip() {
    let i,
      vertices = [];

    this.normal.multiplyScalar(-1);
    this.w *= -1;

    for (i = this.vertices.length - 1; i >= 0; i--) {
      vertices.push(this.vertices[i]);
    }
    this.vertices = vertices;

    return this;
  }

  classifyVertex(vertex: Vertex) {
    var side_value = this.normal.dot(vertex) - this.w;

    if (side_value < -EPSILON) {
      return BACK;
    }
    if (side_value > EPSILON) {
      return FRONT;
    }
    return COPLANAR;
  }

  classifySide(polygon: Polygon) {
    var i,
      vertex,
      classification,
      num_positive = 0,
      num_negative = 0,
      vertice_count = polygon.vertices.length;

    for (i = 0; i < vertice_count; i++) {
      vertex = polygon.vertices[i];
      classification = this.classifyVertex(vertex);
      if (classification === FRONT) {
        num_positive++;
      } else if (classification === BACK) {
        num_negative++;
      }
    }

    if (num_positive > 0 && num_negative === 0) {
      return FRONT;
    }
    if (num_positive === 0 && num_negative > 0) {
      return BACK;
    }
    if (num_positive === 0 && num_negative === 0) {
      return COPLANAR;
    } else {
      return SPANNING;
    }
  }

  splitPolygon(
    polygon: Polygon,
    coplanar_front: any,
    coplanar_back: any,
    front: any,
    back: any
  ) {
    const classification = this.classifySide(polygon);

    if (classification === COPLANAR) {
      (this.normal.dot(polygon.normal) > 0
        ? coplanar_front
        : coplanar_back
      ).push(polygon);
    } else if (classification === FRONT) {
      front.push(polygon);
    } else if (classification === BACK) {
      back.push(polygon);
    } else {
      let vertice_count,
        i,
        j,
        ti,
        tj,
        vi,
        vj,
        t,
        v,
        f = [],
        b = [];

      for (
        i = 0, vertice_count = polygon.vertices.length;
        i < vertice_count;
        i++
      ) {
        j = (i + 1) % vertice_count;
        vi = polygon.vertices[i];
        vj = polygon.vertices[j];
        ti = this.classifyVertex(vi);
        tj = this.classifyVertex(vj);

        if (ti != BACK) f.push(vi);
        if (ti != FRONT) b.push(vi);
        if ((ti | tj) === SPANNING) {
          t =
            (this.w - this.normal.dot(vi)) /
            this.normal.dot(vj.clone().subtract(vi));
          v = vi.interpolate(vj, t);
          f.push(v);
          b.push(v);
        }
      }

      if (f.length >= 3) front.push(new Polygon(f).calculateProperties());
      if (b.length >= 3) back.push(new Polygon(b).calculateProperties());
    }
  }
}
class Vertex {
  public x: number;
  public y: number;
  public z: number;
  public normal: THREE.Vector3;
  public uv: THREE.Vector2;
  constructor(
    x: number,
    y: number,
    z: number,
    normal: THREE.Vector3,
    uv: THREE.Vector2
  ) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.normal = normal || new THREE.Vector3();
    this.uv = uv || new THREE.Vector2();
  }

  clone() {
    return new Vertex(
      this.x,
      this.y,
      this.z,
      this.normal.clone(),
      this.uv.clone()
    );
  }

  add(vertex: Vertex) {
    this.x += vertex.x;
    this.y += vertex.y;
    this.z += vertex.z;
    return this;
  }

  subtract(vertex: Vertex) {
    this.x -= vertex.x;
    this.y -= vertex.y;
    this.z -= vertex.z;
    return this;
  }

  multiplyScalar(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }

  cross(vertex: Vertex) {
    let x = this.x,
      y = this.y,
      z = this.z;

    this.x = y * vertex.z - z * vertex.y;
    this.y = z * vertex.x - x * vertex.z;
    this.z = x * vertex.y - y * vertex.x;

    return this;
  }

  normalize() {
    const length = Math.sqrt(
      this.x * this.x + this.y * this.y + this.z * this.z
    );

    this.x /= length;
    this.y /= length;
    this.z /= length;

    return this;
  }

  dot(vertex: Vertex) {
    return this.x * vertex.x + this.y * vertex.y + this.z * vertex.z;
  }

  lerp(a: Vertex, t: number) {
    this.add(
      a
        .clone()
        .subtract(this)
        .multiplyScalar(t)
    );

    this.normal.add(
      a.normal
        .clone()
        .sub(this.normal)
        .multiplyScalar(t)
    );

    this.uv.add(
      a.uv
        .clone()
        .sub(this.uv)
        .multiplyScalar(t)
    );

    return this;
  }

  interpolate(other: Vertex, t: number) {
    return this.clone().lerp(other, t);
  }

  applyMatrix4(m: THREE.Matrix4) {
    // input: THREE.Matrix4 affine matrix

    let x = this.x,
      y = this.y,
      z = this.z;

    const e = m.elements;

    this.x = e[0] * x + e[4] * y + e[8] * z + e[12];
    this.y = e[1] * x + e[5] * y + e[9] * z + e[13];
    this.z = e[2] * x + e[6] * y + e[10] * z + e[14];

    return this;
  }
}
class Node {
  private polygons: Array<Polygon>;
  private front: Node | undefined;
  private back: Node | undefined;
  private divider: Polygon;

  constructor(polygons: Array<Polygon> = []) {
    let i,
      polygon_count,
      front: Array<Polygon> = [],
      back: Array<Polygon> = [];

    this.polygons = [];
    this.front = this.back = undefined;

    if (!(polygons instanceof Array) || polygons.length === 0) return;

    this.divider = polygons[0].clone();

    for (i = 0, polygon_count = polygons.length; i < polygon_count; i++) {
      this.divider.splitPolygon(
        polygons[i],
        this.polygons,
        this.polygons,
        front,
        back
      );
    }

    if (front.length > 0) {
      this.front = new Node(front);
    }

    if (back.length > 0) {
      this.back = new Node(back);
    }
  }

  isConvex(polygons: Array<Polygon>) {
    let i, j;
    for (i = 0; i < polygons.length; i++) {
      for (j = 0; j < polygons.length; j++) {
        if (i !== j && polygons[i].classifySide(polygons[j]) !== BACK) {
          return false;
        }
      }
    }
    return true;
  }

  build(polygons: Array<Polygon>) {
    let i,
      polygon_count,
      front: Array<Polygon> = [],
      back: Array<Polygon> = [];

    if (!this.divider) {
      this.divider = polygons[0].clone();
    }

    for (i = 0, polygon_count = polygons.length; i < polygon_count; i++) {
      this.divider.splitPolygon(
        polygons[i],
        this.polygons,
        this.polygons,
        front,
        back
      );
    }

    if (front.length > 0) {
      if (!this.front) this.front = new Node();
      this.front.build(front);
    }

    if (back.length > 0) {
      if (!this.back) this.back = new Node();
      this.back.build(back);
    }
  }

  allPolygons() {
    let polygons = this.polygons.slice();
    if (this.front) polygons = polygons.concat(this.front.allPolygons());
    if (this.back) polygons = polygons.concat(this.back.allPolygons());
    return polygons;
  }

  clone() {
    const node = new Node();

    node.divider = this.divider.clone();
    node.polygons = this.polygons.map(polygon => polygon.clone());
    node.front = this.front && this.front.clone();
    node.back = this.back && this.back.clone();

    return node;
  }

  invert() {
    let i, polygon_count, temp;

    for (i = 0, polygon_count = this.polygons.length; i < polygon_count; i++) {
      this.polygons[i].flip();
    }

    this.divider.flip();
    if (this.front) this.front.invert();
    if (this.back) this.back.invert();

    temp = this.front;
    this.front = this.back;
    this.back = temp;

    return this;
  }

  clipPolygons(polygons: Array<Polygon>) {
    let i, polygon_count, front: Array<Polygon>, back: Array<Polygon>;

    if (!this.divider) return polygons.slice();

    front = [];
    back = [];

    for (i = 0, polygon_count = polygons.length; i < polygon_count; i++) {
      this.divider.splitPolygon(polygons[i], front, back, front, back);
    }

    if (this.front) front = this.front.clipPolygons(front);
    if (this.back) back = this.back.clipPolygons(back);
    else back = [];

    return front.concat(back);
  }

  clipTo(node: Node) {
    this.polygons = node.clipPolygons(this.polygons);
    if (this.front) this.front.clipTo(node);
    if (this.back) this.back.clipTo(node);
  }
}

// window.ThreeBSP = ThreeBSP;
